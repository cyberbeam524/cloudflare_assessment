# cloudflare_assessment
 


# Instructions


# Cloudflare Zaraz Technical Assignment

## Description

We've provided a basic example of a widget in `index.ts`. Starting from this project layout, create a player-vs-computer [tic-tac-toe](https://en.wikipedia.org/wiki/Tic-tac-toe) [widget](https://managedcomponents.dev/specs/embed-and-widgets/widgets) using [Managed Components](https://managedcomponents.dev/).

## Key features:

- The player should be able to select whether they are playing as X or O
- Clicking a cell on the 3x3 grid should result in a X or O depending on which the player has selected
- There should be a clear indicator of who’s turn is next after each move is made
- If the game grid is filled without a winner then a draw should be declared
- If there’s a winning line of 3 the winner should be declared 
- The computer adversary can play randomly 

## Implementation details:

### Core success criteria

- All static assets required for the games should be provided entirely by the Managed Component (MC) with no dependent html from the site where it’s included
- Each position where the computer adversary plays next should be retrieved from a [Cloudflare worker](https://developers.cloudflare.com/workers/) of your creation, separate to that of the MC widget
- [`manager.route`](https://managedcomponents.dev/specs/server-functionality/route) and [`manager.fetch`](https://managedcomponents.dev/specs/server-functionality/fetch) should be used to ensure that all requests between the browser and the widget are first-party
- Clearing the grid and restarting the game

### How to run the project

- `npm run dev` to start the development server

## Deliverables

- a link to the git repository containing your MC and worker code
- users of your MC (via a site proxied by Webcm) should be able to complete a game of tic tac toe using the mouse, against an artificial adversary, with a declared winner when the game is over

**Everything that was not mentioned above is optional.**
