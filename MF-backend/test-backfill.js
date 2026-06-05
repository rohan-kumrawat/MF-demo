const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/v1/sequences/backfill', {}, {
      headers: {
        // Wait, how to get a token? I can't hit it without a token!
      }
    });
    console.log(res.data);
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
