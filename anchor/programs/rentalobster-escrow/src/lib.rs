use anchor_lang::prelude::*;
use anchor_lang::system_program;

// Replace this with the output of `anchor keys list` after `anchor build`
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub const CONFIG_SEED: &[u8] = b"ro_config";
pub const ESCROW_SEED: &[u8] = b"ro_escrow";
pub const VAULT_SEED: &[u8] = b"ro_vault";

// ─── Program ─────────────────────────────────────────────────────────────────

#[program]
pub mod rentalobster_escrow {
    use super::*;

    /// One-time setup: store platform authority and treasury wallet on-chain.
    /// Call this once after deployment with your platform keypair as the signer.
    pub fn initialize(ctx: Context<Initialize>, treasury: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = treasury;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    /// Renter locks SOL (agent fee + platform fee) in a vault PDA.
    ///
    /// Accounts (in order):
    ///   0. escrow      — init, seeds [ro_escrow, renter, nonce]
    ///   1. vault        — mut,  seeds [ro_vault, escrow_key]
    ///   2. renter       — mut signer (payer)
    ///   3. system_program
    pub fn create_rental(
        ctx: Context<CreateRental>,
        nonce: [u8; 8],
        amount_lamports: u64,        // agent owner's share
        platform_fee_lamports: u64,  // platform treasury share
        agent_owner: Pubkey,
    ) -> Result<()> {
        require!(amount_lamports > 0, EscrowError::InvalidAmount);

        let escrow = &mut ctx.accounts.escrow;
        escrow.renter              = ctx.accounts.renter.key();
        escrow.agent_owner         = agent_owner;
        escrow.amount_lamports     = amount_lamports;
        escrow.platform_fee_lamports = platform_fee_lamports;
        escrow.status              = EscrowStatus::Active;
        escrow.nonce               = nonce;
        escrow.bump                = ctx.bumps.escrow;
        escrow.vault_bump          = ctx.bumps.vault;

        let total = amount_lamports
            .checked_add(platform_fee_lamports)
            .ok_or(EscrowError::Overflow)?;

        // Transfer renter SOL → vault PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.renter.to_account_info(),
                    to:   ctx.accounts.vault.to_account_info(),
                },
            ),
            total,
        )?;

        Ok(())
    }

    /// Release escrow funds: agent owner receives their cut, treasury gets the fee.
    /// Callable by: the renter (satisfied) OR the platform authority (after expiry).
    ///
    /// Accounts (in order):
    ///   0. config        — read, seeds [ro_config]
    ///   1. escrow        — mut,  seeds [ro_escrow, renter, nonce]
    ///   2. vault         — mut,  seeds [ro_vault, escrow_key]
    ///   3. agent_owner   — mut,  must == escrow.agent_owner
    ///   4. treasury      — mut,  must == config.treasury
    ///   5. signer        — signer (renter or authority)
    ///   6. system_program
    pub fn complete_rental(ctx: Context<CompleteRental>) -> Result<()> {
        let signer_key = ctx.accounts.signer.key();
        let escrow     = &ctx.accounts.escrow;

        require!(
            signer_key == escrow.renter || signer_key == ctx.accounts.config.authority,
            EscrowError::Unauthorized
        );

        let agent_payout = escrow.amount_lamports;
        let fee_payout   = escrow.platform_fee_lamports;
        let escrow_key   = ctx.accounts.escrow.key();
        let vault_bump   = escrow.vault_bump;
        let vault_seeds: &[&[u8]] = &[VAULT_SEED, escrow_key.as_ref(), &[vault_bump]];

        // vault → agent_owner
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to:   ctx.accounts.agent_owner.to_account_info(),
                },
                &[vault_seeds],
            ),
            agent_payout,
        )?;

        // vault → treasury
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to:   ctx.accounts.treasury.to_account_info(),
                },
                &[vault_seeds],
            ),
            fee_payout,
        )?;

        ctx.accounts.escrow.status = EscrowStatus::Completed;
        Ok(())
    }

    /// Refund all locked SOL back to the renter. Platform authority only.
    ///
    /// Accounts (in order):
    ///   0. config       — read, seeds [ro_config]
    ///   1. escrow       — mut,  seeds [ro_escrow, renter, nonce]
    ///   2. vault        — mut,  seeds [ro_vault, escrow_key]
    ///   3. renter       — mut,  must == escrow.renter
    ///   4. authority    — signer, must == config.authority
    ///   5. system_program
    pub fn refund_rental(ctx: Context<RefundRental>) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        let total  = escrow
            .amount_lamports
            .checked_add(escrow.platform_fee_lamports)
            .ok_or(EscrowError::Overflow)?;

        let escrow_key = ctx.accounts.escrow.key();
        let vault_bump = escrow.vault_bump;
        let vault_seeds: &[&[u8]] = &[VAULT_SEED, escrow_key.as_ref(), &[vault_bump]];

        // vault → renter (full refund)
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to:   ctx.accounts.renter.to_account_info(),
                },
                &[vault_seeds],
            ),
            total,
        )?;

        ctx.accounts.escrow.status = EscrowStatus::Refunded;
        Ok(())
    }
}

// ─── Contexts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = ProgramConfig::SPACE,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(nonce: [u8; 8])]
pub struct CreateRental<'info> {
    #[account(
        init,
        payer = renter,
        space = RentalEscrow::SPACE,
        seeds = [ESCROW_SEED, renter.key().as_ref(), nonce.as_ref()],
        bump
    )]
    pub escrow: Account<'info, RentalEscrow>,
    /// CHECK: Vault PDA that holds SOL — verified by seeds
    #[account(
        mut,
        seeds = [VAULT_SEED, escrow.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub renter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteRental<'info> {
    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, ProgramConfig>,
    #[account(
        mut,
        seeds = [ESCROW_SEED, escrow.renter.as_ref(), escrow.nonce.as_ref()],
        bump = escrow.bump,
        constraint = escrow.status == EscrowStatus::Active @ EscrowError::NotActive,
    )]
    pub escrow: Account<'info, RentalEscrow>,
    /// CHECK: Vault PDA — verified by seeds
    #[account(
        mut,
        seeds = [VAULT_SEED, escrow.key().as_ref()],
        bump = escrow.vault_bump,
    )]
    pub vault: UncheckedAccount<'info>,
    /// CHECK: Must match escrow.agent_owner
    #[account(
        mut,
        constraint = agent_owner.key() == escrow.agent_owner @ EscrowError::WrongAgentOwner
    )]
    pub agent_owner: UncheckedAccount<'info>,
    /// CHECK: Must match config.treasury
    #[account(
        mut,
        constraint = treasury.key() == config.treasury @ EscrowError::WrongTreasury
    )]
    pub treasury: UncheckedAccount<'info>,
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundRental<'info> {
    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, ProgramConfig>,
    #[account(
        mut,
        seeds = [ESCROW_SEED, escrow.renter.as_ref(), escrow.nonce.as_ref()],
        bump = escrow.bump,
        constraint = escrow.status == EscrowStatus::Active @ EscrowError::NotActive,
    )]
    pub escrow: Account<'info, RentalEscrow>,
    /// CHECK: Vault PDA — verified by seeds
    #[account(
        mut,
        seeds = [VAULT_SEED, escrow.key().as_ref()],
        bump = escrow.vault_bump,
    )]
    pub vault: UncheckedAccount<'info>,
    /// CHECK: Must match escrow.renter
    #[account(
        mut,
        constraint = renter.key() == escrow.renter @ EscrowError::WrongRenter
    )]
    pub renter: UncheckedAccount<'info>,
    #[account(
        constraint = authority.key() == config.authority @ EscrowError::Unauthorized
    )]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// ─── State ────────────────────────────────────────────────────────────────────

#[account]
pub struct ProgramConfig {
    pub authority: Pubkey,  // 32 — platform authority that can complete/refund
    pub treasury:  Pubkey,  // 32 — wallet that receives platform fees
    pub bump:      u8,      //  1
}

impl ProgramConfig {
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 16; // 8 discriminator + data + 16 padding
}

/// Borsh memory layout (after 8-byte discriminator):
///   offset  0: renter              (32 bytes)
///   offset 32: agent_owner         (32 bytes)
///   offset 64: amount_lamports     (u64 LE, 8 bytes)
///   offset 72: platform_fee_lamports (u64 LE, 8 bytes)
///   offset 80: status              (u8, 1 byte: 0=Active 1=Completed 2=Refunded 3=Disputed)
///   offset 81: nonce               ([u8;8], 8 bytes)
///   offset 89: bump                (u8)
///   offset 90: vault_bump          (u8)
#[account]
pub struct RentalEscrow {
    pub renter:               Pubkey,       // 32
    pub agent_owner:          Pubkey,       // 32
    pub amount_lamports:      u64,          //  8
    pub platform_fee_lamports: u64,         //  8
    pub status:               EscrowStatus, //  1
    pub nonce:                [u8; 8],      //  8
    pub bump:                 u8,           //  1
    pub vault_bump:           u8,           //  1
}

impl RentalEscrow {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 1 + 8 + 1 + 1 + 16; // +16 padding
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Active,     // 0
    Completed,  // 1
    Refunded,   // 2
    Disputed,   // 3
}

// ─── Errors ───────────────────────────────────────────────────────────────────

#[error_code]
pub enum EscrowError {
    #[msg("amount_lamports must be > 0")]
    InvalidAmount,
    #[msg("Escrow is not in Active status")]
    NotActive,
    #[msg("Signer is not authorized for this action")]
    Unauthorized,
    #[msg("agent_owner account does not match escrow")]
    WrongAgentOwner,
    #[msg("treasury account does not match config")]
    WrongTreasury,
    #[msg("renter account does not match escrow")]
    WrongRenter,
    #[msg("Arithmetic overflow")]
    Overflow,
}
