# River Trading

A dark-themed cryptocurrency dashboard inspired by modern crypto apps. Built with React, TypeScript, and Vite.

## Features

- **Header** – River logo and profile button
- **Our Mission** – Gradient banner with short mission statement and Bitcoin-style graphic
- **Quick actions** – Deposit, Withdraw, Staking, Services
- **Featured pairs** – BTC, ETH, BNB with last price and 24h change
- **Crypto list** – Scrollable table of 15 pairs with last price and 24h change % (green/red)
- **Bottom nav** – HOME (active), MARKET, TRADE, FEATURES, WALLETS
- **Network background** – Animated dots and connecting lines

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Stack

- React 18 + TypeScript
- Vite 5
- CSS (no UI framework)

Data is static; you can later plug in a real API (e.g. Binance) for live prices.
