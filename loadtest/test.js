import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 users
    { duration: '1m', target: 100 }, // Stay at 100 users
    { duration: '30s', target: 0 }, // Ramp-down
  ],
};

export default function () {
  let url = 'http://localhost:8787/move';
  // let url = 'https://workeradv.maaruni505.workers.dev/move';
  let payload = JSON.stringify({
    board: [null, 'X', 'O', null, 'X', null, 'O', null, null],
    player: 'X'
  });
  let params = {
    headers: { 'Content-Type': 'application/json' },
  };
  http.post(url, payload, params);
  sleep(1);
}
