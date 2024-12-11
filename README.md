
# Prediction Game - Frontend

## Description

Bullish Games is a launchpad for exciting and strategic price prediction games built on the Solana blockchain. It allows players to predict the price movement of their favorite cryptocurrencies over a set period and win rewards. The game leverages the Pyth Oracle network for real-time price feeds and supports SPL tokens for betting and rewards.

### How to Play the BullBear Game

1. **Round Initialization:**
   - The game creator sets up the parameters:
     - **Cryptocurrency**: The token for price prediction (e.g., SOL).
     - **Bet Token**: The SPL token used for placing bets and paying rewards.
     - **Round Interval**: The duration of the round.
   - When the round starts, the current price of the selected cryptocurrency is recorded as `start_price`, and the `start_time` is noted.

2. **Betting Phase:**
   - The betting phase is **open** at the start of the round.
   - Players place bets predicting the price movement of the selected cryptocurrency at `end_time` (`start_time + round_interval`):
     - **Bull**: Predicting the price will go **bull**.
     - **Bear**: Predicting the price will go **bear**.
   - Bets can only be placed during the first half of the interval.

3. **Betting Closes:**
   - Once half of the round interval has passed, the betting phase is **closed**. No more bets are accepted for the ongoing round.

4. **Outcome Determination:**
   - At `end_time`, the price of the cryptocurrency is observed as `end_price`.
   - The price movement is evaluated:
     - If `end_price` > `start_price`: **Bull**.
     - If `end_price` < `start_price`: **Bear**.
     - If `end_price` == `start_price`: **No change**.

5. **Winners and Protocol Rules:**
   - Players who predicted the price movement correctly are the **winners**.
   - If there is no price change, the protocol wins, and all funds are transferred to the game vault.

6. **Claiming Rewards:**
   - After the round ends, winners can claim their rewards from the prize pool.
   - Each winner's reward is proportional to their bet amount compared to the total bet amount on the winning side.

## Features and Customization
- **Custom Cryptocurrencies**: Choose any token with a price feed on the Pyth Oracle network.
- **Flexible Betting Tokens**: Use any SPL token for betting and rewards.
- **Dynamic Intervals**: Define custom time intervals for each game round.

The BullBear Game combines blockchain transparency with the thrill of market prediction, creating a fair and engaging experience for all players. Predict, bet, and claim your winnings—are you ready to take on the market?

### Deployment

You find the deloyed app at: [https://prediction-game-theta.vercel.app/](https://prediction-game-theta.vercel.app/)

## Structure

 - admin view
    - button to create a new game
      - TODO:
        - enter interval
        - enter price feed
    - button to start game (initialize and start round)
    TODO:
    - button to close betting
    - button to end round
    - button to withdraw
    
 - game view
    - shows running games
    - button for up
    - button for down
    TODO:
    - button to claim reward
   

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

The responsive version for wallets and wallet adapter may not function or work as expected for mobile based on plugin and wallet compatibility. For more code examples and implementations please visit the [Solana Cookbook](https://solanacookbook.com/)

## Installation

```bash
npm install
```
## Configuration

To run the protocol you need a private key that can sign transactions from the backend. Add a `.env.local` file to the root of the project with the following variables:

```bash
PRIVATE_KEY=your_private_key
```

## Build and Run

Next, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

To build the project for production, run:

```bash
npm run build
```


## Features

Each Scaffold will contain at least the following features:

```
Wallet Integration with Auto Connec / Refresh

State Management

Components: One or more components demonstrating state management

Web3 Js: Examples of one or more uses of web3 js including a transaction with a connection provider

Sample navigation and page changing to demonstate state

Clean Simple Styling 

Notifications (optional): Example of using a notification system

```

A Solana Components Repo will be released in the near future to house a common components library.


### Structure

The scaffold project structure may vary based on the front end framework being utilized. The below is an example structure for the Next js Scaffold.
 
```
├── public : publically hosted files
├── src : primary code folders and files 
│   ├── components : should house anything considered a resuable UI component
│   ├── contexts` : any context considered reusable and useuful to many compoennts that can be passed down through a component tree
│   ├── hooks` : any functions that let you 'hook' into react state or lifecycle features from function components
│   ├── models` : any data structure that may be reused throughout the project
│   ├── pages` : the pages that host meta data and the intended `View` for the page
│   ├── stores` : stores used in state management
│   ├── styles` : contain any global and reusable styles
│   ├── utils` : any other functionality considered reusable code that can be referenced
│   ├── views` : contains the actual views of the project that include the main content and components within
style, package, configuration, and other project files

```

