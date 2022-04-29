// Focus div based on nav button click

// Flip one coin and show coin image to match result when button clicked
const coin = document.getElementById("coin")
// Add event listener for coin button in div#single
coin.addEventListener("click", flipCoin)
// Asynchronus function that listens for response
async function flipCoin() {
    // Endpoint URL
    const endpoint = "app/flip/"
    const url = document.baseURI+endpoint
    // Send request to API and wait for response
    await fetch(url)
    // Receive response 
    .then(function(response) {
        return response.json();
        })
        // Process response
        .then(function(result) {
            console.log(result);
            document.getElementById("result").innerHTML = result.flip;
            document.getElementById("quarter").setAttribute("src", "assets/img/"+result.flip+".png");
          });

// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series\
const coins = document.getElementById("coins")
// Add listener
coins.addEventListener("submit", flipCoins)
// Asynchronus listening function for multiple coins
async function flipCoins(event) {
    // Prevent the default browser event 
    event.preventDefault();
    // Endpoint URL
    const endpoint = "app/flip/coins/"
	const url = document.baseURI+endpoint
    // Extract data from form
    const formEvent = event.currentTarget
    // Put data in FormData in order to wait for either a response or an error to be thrown
    try {
		const formData = new FormData(formEvent);
        const flips = await sendFlips({ url, formData });
        console.log(flips);
        document.getElementById("heads").innerHTML = "Heads: "+flips.summary.heads;
		document.getElementById("tails").innerHTML = "Tails: "+flips.summary.tails;
        document.getElementById("coinlist").innerHTML = coinList(flips.raw);
	} catch (error) {
		console.log(error);
	}
}

// Guess a flip by clicking either heads or tails button
// Input value to be sent to API
const call = document.getElementById("call")
// Add listener
call.addEventListener("submit", flipCall)
// Asychronus function for guess
async function flipCall(event) {
    // Prevent default browser event
    event.preventDefault();
    // Endpoint URL
    const endpoint = "app/flip/call/"
	const url = document.baseURI+endpoint
    // Extract data
    const formEvent = event.currentTarget
    // Put data in FormData in order to wait for either a response or an error to be thrown
    try {
		const formData = new FormData(formEvent); 
        const results = await sendFlips({ url, formData });
        console.log(results);
        document.getElementById("choice").innerHTML = "Guess: "+results.call;
		document.getElementById("actual").innerHTML = "Actual: "+results.flip;
		document.getElementById("results").innerHTML = "Result: "+results.result;
        document.getElementById("coingame").innerHTML = '<li><img src="assets/img/'+results.call+'.png" class="bigcoin" id="callcoin"></li><li><img src="assets/img/'+results.flip+'.png" class="bigcoin"></li><li><img src="assets/img/'+results.result+'.png" class="bigcoin"></li>';
	} catch (error) {
		console.log(error);
	}
}


}
