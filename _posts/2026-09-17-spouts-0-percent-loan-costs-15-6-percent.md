---
layout: post
title: "Spout's 0% Loan Costs 15.6%"
date: 2026-09-17 14:30:00 -0300
categories: defi rwa teardown
---

# Spout's 0% Loan Costs 15.6%

Spout Finance lets you borrow stablecoins against tokenized US equities at 0% interest. The 0% is real as a line item and misleading as an economic claim. The borrower doesn't pay interest in stablecoins; the borrower pays in sold optionality on their own collateral, and by Spout's own published numbers that cost is roughly **15.6% annualized** — higher than the margin loan the product is positioned to replace.

Everything below comes from Spout's public documentation and from a hands-on session on their devnet beta on 17 September 2026. No insider information, no assumptions the docs don't support.

---

## The arithmetic

Spout's tranche walkthrough gives a complete worked example. Take it at face value:

| Input (Spout's own example) | Value |
|---|---|
| Lending pool | $10,000,000 |
| Gross options premium collected | $30,000 / week |
| Protocol fee | 20% of gross |
| Lender share | 80% of gross |

The calls are written against **borrower collateral**. From the `Option Assignment` page: *"Because locked collateral backs covered calls written by the protocol."* At the maximum 50% LTV, a $10m stablecoin pool that is fully drawn is backed by **$20m of borrower equities**.

So:

- Annual gross premium = $30,000 × 52 = **$1,560,000**
- That premium is extracted from $20m of borrower-owned shares → **7.8% of collateral notional per year**
- Borrowers received $10m of loans for it → **effective cost of funds = 1,560,000 / 10,000,000 = 15.6% APR**

Every dollar of that premium goes to lenders (80%) and the protocol (20%). The borrower receives none of it. The borrower's compensation is the loan itself.

For comparison: Interactive Brokers margin runs about 5–6%. Aave USDC sits around 5–8%. A private-bank securities-backed line of credit is 6–8%. Spout's borrower is paying roughly double the incumbent rate, and the pricing is invisible because it's denominated in foregone upside rather than in dollars.

This is not a bug in the protocol. It's a bug in how the protocol is described.

## The 0.5% number measures something else

Spout's FAQ states the covered-call cost to borrowers *"historically averages around 0.5% annualized across the portfolio."*

That figure is the **realized assignment loss** — the ex-post cost of calls that finished in the money. It is not the cost of the position. When you sell an option you pay its full value at the moment of sale, whether or not it is later exercised. The ex-ante cost is the premium: 7.8% of notional.

Quoting realized assignment loss as "the cost" is the same error as quoting an insurer's claims paid in a quiet year as the price of the policy.

The gap between 0.5% and 7.8% is precisely the variance risk premium Spout says it is harvesting. Spout is correct that the VRP exists. It is simply telling lenders that the VRP is their return while telling borrowers it costs them almost nothing. Both cannot be true. It is the same dollar.

## Two documentation pages contradict each other

From `Strike Selection Philosophy`:

> "If the underlying rallies modestly, the call expires worthless and the borrower keeps everything: the premium, the shares, and the full upside of the move."

From `Fees`:

> "Protocol fee: 20% of gross premium. Taken from each cycle's options premium before distribution; lenders receive the other 80%."

The borrower cannot keep the premium if the protocol takes 20% and lenders take 80%. One of these pages is wrong. Based on the tranche math, the settlement flow, and the loss waterfall — all of which route premium to lenders — the error is in Strike Selection.

It's a one-line fix: *"the call expires worthless and the borrower keeps the shares and the full upside of the move."* As written, it is the single most load-bearing sentence in the borrower-facing docs, and it is false.

## Liquidation is offline about 80% of the time

From `Oracles and Price Feeds`:

> "prices update in real time during US market hours and at reduced frequency during off-hours, since the underlying equities only trade during market sessions."

US equity regular sessions run 09:30–16:00 ET, five days a week: **32.5 of 168 hours, or 19.3% of the week.** The debt is a stablecoin obligation on Solana, live 24/7. The collateral has a continuously meaningful price less than a fifth of the time.

Overlay Spout's own worked example. NVDA is given a liquidation line at 58.8% LTV — an 8.8 percentage-point buffer above the 50% entry. The example then walks NVDA down in two orderly weekly steps (−8%, then −7.6%) and partial liquidation catches it cleanly.

That is not how single-name equities move. NVDA's post-earnings gaps have repeatedly exceeded 15% overnight, and gap moves are the *dominant* loss mode for concentrated single-name collateral. A 15% overnight gap takes a position from 50% LTV through the 58.8% line to roughly 69% before any price the protocol can act on exists.

So partial liquidation — the core borrower-protection mechanism — is structurally unable to engage on exactly the risk that matters most. The docs demonstrate it against a slow grind, which is the scenario it handles well and the scenario that rarely produces insolvency.

Things the docs should answer and don't: what happens to a position already below the liquidation line when the market opens; whether there is a pre-market or post-market liquidation window and at what price source; whether earnings dates are handled specially.

## Auto-Roll buys high after selling low

From `Option Assignment`, with Auto-Roll on by default:

> "The shares are sold at the strike... the residual proceeds are automatically used to rebuy the same asset and re-enroll it in the next cycle."

Assignment happens only when the stock closes **above** the strike. So the sequence is: sell at the strike, then immediately repurchase at the prevailing market price, which is by construction higher. The difference is a realized loss, and it recurs every time the position is assigned — that is, every time the borrower's thesis on the stock is most right.

Add the 0.20% buy/sell fee on each leg and the default setting converts strong rallies into a mechanized sell-low/buy-high loop with a transaction cost attached.

This is the mechanic that most directly falsifies the homepage promise — *"keep your upside and unlock liquidity without selling"* — because the position is in fact sold, at a capped price, on a recurring schedule. Auto-Roll is a reasonable feature. Defaulting it on without surfacing the realized cost per roll is the problem.

---

# The beta prints the wrong number on screen

All of the above is a reading of the documentation. I expected the app to be silent on the borrower's real cost. It isn't silent — it's worse than silent.

The trade table carries a column labelled **"Borrow Cost"**, in percent per year:

| NVDA | BSOL | SMCI | GLD | PFE | AAPL | GOOG | IBIT | MSTR | XOM | GS |
|---|---|---|---|---|---|---|---|---|---|---|
| 0.00%/yr | 0.00 | 0.00 | 0.06 | 0.07 | 0.37 | 0.54 | 0.55 | 0.58 | 0.80 | 0.86 |

The buy widget repeats it: **"Est. borrower cost/yr — $0.00."**

These are realized-assignment-loss numbers, presented as the cost of borrowing. The column header has no tooltip. The widget's "About borrower cost" control opens nothing, on click or on hover. There is no definition of the term anywhere in the interface.

A borrower reading "NVDA — borrow cost 0.00%/yr" is being quoted zero for something that, by the protocol's own tranche example, costs about fifteen percent a year.

That's the whole thesis of this post, rendered on screen. The gap between the engineering and the marketing isn't an interpretation of the docs. It's a column in a table.

## Two bugs worth reporting

I couldn't complete a transaction. Two separate defects stopped it, and both are cheap to fix.

**The production CSP blocks the app's own Solana RPC.** No wallet or login needed to reproduce:

```
$ curl -sSI https://beta.spout.finance/buy | grep -i content-security-policy
... connect-src 'self' https://auth.privy.io https://*.rpc.privy.systems
    https://explorer-api.walletconnect.com wss://relay.walletconnect.com
    wss://relay.walletconnect.org wss://www.walletlink.org
    https://*.withpersona.com https://axartrdqynqtfclakxru.supabase.co
    wss://axartrdqynqtfclakxru.supabase.co ...
```

No Solana RPC host appears in `connect-src`. The client calls `https://api.devnet.solana.com/` and the browser refuses it. The console repeats, roughly every 15 seconds:

```
Connecting to 'https://api.devnet.solana.com/' violates the following
Content Security Policy directive: "connect-src 'self' ..."

useAssetPrice(NVDA): Error: failed to get info about account
ERhwDiUmByKM3UrmVxibyjrr9MKzYHsKgjp3Bs8BjrwQ: TypeError: Failed to fetch
```

There is no fallback RPC — filtering the network log for any Solana endpoint returns zero requests. The calls never leave the browser. Prices still render only because they come from the app's own origin, not from chain.

What this looks like in use: 20 test USDC sitting in the wallet, confirmed on chain, and the app showing `$0 USDC`, an "Insufficient Balance" modal, and a "Refresh Balance" button that cannot ever succeed. Stripping the CSP header in the browser and reloading makes `$20 USDC` appear immediately. One header line is the entire defect.

It also explains a bug other reviewers have already published — "sell flow reads zero balance on held assets" is exactly what a blocked `getAccountInfo` produces. That's a symptom. This is the cause.

The deeper fix is to treat an RPC read failure as an error state. Right now a total loss of chain connectivity renders as a confident `$0`, "No Holdings", "No Positions" — indistinguishable from a genuinely empty account. A user with real collateral would be told, without caveat, that they hold nothing.

**Buying fails silently after you sign.** With the CSP bypassed so the flow could proceed, a $10 NVDA market buy failed four times out of four, and the interface reported success every time:

1. `POST /api/orders/buy` returns `200`, with `"preflight":{"blockers":[],"warnings":[]}` and an unsigned transaction.
2. The wallet modal says "Buy NVDA — Spend $10.00 on NVDA at the market price." You sign.
3. `POST /api/orders/submit` returns **`400 Bad Request`**.
4. Console: `[order] transaction failed: Simulation failed. Message: Transaction simulation failed: Blockhash not found.`
5. The modal displays: **"Order signed — Submitting it to Solana now — this can take a moment."** No error is ever shown.

Nothing lands. Across the session the wallet's only on-chain transactions were two faucet transfers and one identity enrollment; the USDC balance never moved. The transaction's validity window was 822 blocks, so expiry isn't the explanation — "Blockhash not found" against a freshly-minted blockhash points at the submitting node not having seen the blockhash the backend issued.

A transaction that fails is a bug. A transaction that fails while the interface says it succeeded is a trust problem: the user walks away believing they own NVDA. On a devnet beta that costs nothing. The same code path on mainnet loses money and confidence at once.

One more thing worth flagging: the only application transaction that did land in the whole session decodes to `CreateIdentityForUser` + `SetVerified` — identity enrollment, no USDC transfer, no share mint. The dialog that produced it said "Buy NVDA — Spend $10.00." Bundling a silent identity write behind a button labelled as a purchase deserves its own screen and its own consent, particularly for a product whose compliance story is a selling point.

## What works

The onboarding is genuinely good, and it's worth saying so plainly. Email and passcode, an access card, a Privy email OTP, and you're in — no browser extension anywhere in the flow. The wallet modal is the best-executed screen in the product: address, copy button, and both faucets linked with one plain sentence each explaining what the token is for. "What orders are priced in." "Pays the network fee on every trade." That is better testnet onboarding than most protocols ship.

The navigation carries a live market clock — "Market: Open. Closes in 6:15:42" — which is the right instinct for a product whose collateral only trades 19.3% of the week.

And the app answers a question the documentation doesn't. Under the buy widget: **"Held 1:1 at Alpaca Securities · Reserves 100.2%."** The `Oracles` page refers to "the regulated broker" and never names it. The application names it in eight words. That belongs in the docs too.

## Open questions

- Under what exemption are spAssets offered, and which jurisdictions are excluded? A live question for any non-US participant, including me.
- Is custody bankruptcy-remote from Spout, and what is the claim path for a token holder if the broker fails? Who performs the Proof of Reserve attestation? The attestor is unnamed in both the docs and the UI.
- Proof of Reserve verifies supply, not encumbrance. If shares backing spAssets are simultaneously pledged against written calls, an attestation that the shares *exist* doesn't establish that they are *unencumbered*. What fraction of reserve is committed to open options positions at attestation time?
- The Junior tranche — 15% of the pool, ~32.8% APY, second-loss, with a 45-day withdrawal notice — is a short-volatility carry position sold as a yield product. A short-vol position whose holders cannot exit for 45 days during a volatility event is the exact configuration that turns a drawdown into a cascade. The backtest disclaimer ("a loss large enough to reach Senior has not occurred in any historical scenario we have tested") is doing heavy lifting against a launch roster of 11 names weighted to large-cap tech, AI and crypto-linked ETFs. Publish the backtest window and the worst weekly drawdown observed, and run the scenario with correlation set to 1.0.

---

None of this is an argument that Spout is badly built. The risk architecture is documented more carefully than most of its peers, the tranching math is coherent, and the team publishes enough detail that an outsider can check their work — which is exactly how I was able to write this.

The problem is that the number the borrower is quoted and the number the borrower pays are not the same number, and the interface currently quotes the wrong one with more confidence than the documentation does.

*Session run 17 September 2026 against `beta.spout.finance` on Solana devnet. All on-chain claims are verifiable against `api.devnet.solana.com` for wallet `DwiBvACxP4JinBXpFju323j78cKe35U4W1ErWwrzSVh1`.*
