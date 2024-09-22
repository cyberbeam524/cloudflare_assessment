import { ComponentSettings, Manager } from "@managed-components/types"

import {tictactoeHTML, gameJS, styleCSS} from './scripts';

import dotenv from 'dotenv'; 
dotenv.config();  // Load environment variables from .env file 
const WORKERURL = process.env.workeradv_url;  // Retrieve the environment variable 

export default async function (manager: Manager, _settings: ComponentSettings) {
  manager.addEventListener("pageview", (event) => {
    console.log("Pageview detected!");
    event.client.execute("console.log('Tic-Tac-Toe Loaded!')");
  });

  manager.route("/static/game.js", async (request) => {
    return new Response(gameJS, {
      headers: { "Content-Type": "application/javascript" }
    });
  });

  manager.route("/static/styles.css", async (request) => {
    return new Response(styleCSS, {
      headers: { "Content-Type": "text/css" }
    });
  });

  manager.route("/move", async (request) => {
    try {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      const requestBody = await request.body;
      const { board, player } = requestBody;
  
      // Validate the inputs
      if (!board || !player) {
        return new Response('Invalid input', { status: 400 });
      }
  
      //Send the board and player information to the Cloudflare Worker
      const workerUrl = WORKERURL
      const response = await manager.fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ board, player }), // Send board and player data to Cloudflare Worker
      });
  
      // Check if the response is JSON
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        // Return the AI's move as a JSON response
        return new Response(JSON.stringify({ move: data.move }), {
          headers: { "Content-Type": "application/json" }
        });
      } else {
        console.error('Cloudflare Worker did not return JSON:', await response.text());
        return new Response('Invalid response from Cloudflare Worker', { status: 502 });
      }
    } catch (error) {
      console.error('Error fetching next move from Cloudflare Worker:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  });

  manager.registerWidget(async () => {
    return tictactoeHTML();
  });
}