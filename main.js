// this script fetches all messages from the bottom of the view port and deletes all the way to the top of the conversation
// it is primarily used to delete ALL of your messages in a conversation, however, some code adjustments can make it stop wherever you want
// the following is the steps to delete ONE message on Instagram
// (1) hover beside each message for the 3 dots to appear
// (2) click the "More" button (the three dots)
// (3) click the "Unsend" button
// (4) click "Unsend" again once the confirmation popup appears

load = true; // when set to false after loadChat() has been called, breaks out of the function's while loop (i.e. stops loading the chat)
del = true; // when set to false after deleteChat() has been called, breaks out of the function's while loop (i.e. stops deleting the conversation)
delReact = true; // when set to false, deleteReaction() does not run (this is useful when you're blocked and are unable to remove reactions)

loadChat();
// deleteChat();

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// loads chat by constantly scrolling to the top
async function loadChat() {
	// getting the div of the conversation
	let conversationWindow = document.getElementsByClassName(
		"x78zum5 xdt5ytf x1iyjqo2 xs83m0k x1xzczws x6ikm8r x1rife3k x1n2onr6 xh8yej3 x16o0dkt"
	)[1]; // returns 2 elements, [0] is the div of all conversations, [1] is the div of current conversation
	let lastScrollTop = conversationWindow.scrollTop;
	let samePositionTime = 0; // To track how long the scrollTop hasn't changed

	while (load) {
		conversationWindow.scrollTo(0, 0);
		await delay(250); // we add a delay to not break the program by instant function calls

		// Check if the scrollTop has changed
		if (conversationWindow.scrollTop === lastScrollTop) {
			samePositionTime += 250; // Increment the same position time
		} else {
			samePositionTime = 0; // Reset if the scrollTop changes
		}

		// If the scrollTop hasn't changed for 3 seconds, break out of the loop
		if (samePositionTime >= 3000) {
			break;
		}

		lastScrollTop = conversationWindow.scrollTop; // Update the last scrollTop value
	}
	// once chat is loaded, scroll to the bottom
	conversationWindow.scrollTo(0, conversationWindow.scrollHeight);
	await delay(100);
	deleteChat();
}

async function deleteMessages(conversation, messages) {
	for (let i = messages.length - 1; i >= 0; i--) {
		let lastMessage = messages[i];
		let scrolled = false;

		// continue if message is below viewport
		if (lastMessage.getBoundingClientRect().top > window.innerHeight - 77) {
			continue;
		}

		let conversationWindow = document.getElementsByClassName(
			"x78zum5 xdt5ytf x1iyjqo2 xs83m0k x1xzczws x6ikm8r x1rife3k x1n2onr6 xh8yej3 x16o0dkt"
		)[1];

		if (lastMessage.classList.length === 1) {
			conversationWindow.scrollBy(0, -50);
			scrolled = true;
			continue;
		}

		// check if the lastMessage is above the viewport
		let lastMessagePosition = lastMessage.getBoundingClientRect();
		if (lastMessagePosition.top - 75 < 0) {
			lastMessage.scrollIntoView();
			scrolled = true;
			await delay(75); // wait for the scroll action to finish
		}

		// (1)
		// dispatch a mouseover event (i.e. hover beside the message)
		lastMessage.dispatchEvent(
			new MouseEvent("mouseover", {
				view: window,
				bubbles: true,
				cancelable: true,
			})
		);
		await delay(25);

		// (2)
		// the options when hovering over a message are "React", "Reply", and "More" but messages like photos are missing the "More" option, which means we want to skip
		let options = lastMessage.getElementsByClassName("x6s0dn4 x78zum5 xdt5ytf xl56j7k");
		if (options.length === 0) {
			conversation.click();
			await deleteReaction(lastMessage);
			continue;
		}

		let option = options[options.length - 1];
		if (option.querySelector("title").textContent != "More") {
			conversation.click();
			await deleteReaction(lastMessage);
			continue;
		}

		option.click();
		await delay(25);

		// (3)
		// the following selector returns a list of HTML Elements
		// namely the span elements "Time"[0], "Forward"[1], "Copy"[2], and "Unsend"[3]
		let moreUI = document.getElementsByClassName(
			"x9f619 xjbqb8w x78zum5 x168nmei x13lgxp2 x5pf9jr xo71vjh x1uhb9sk x1plvlek xryxfnj x1c4vz4f x2lah0s xdt5ytf xqjyukv x1qjc9v5 x1oa3qoh x1nhvcw1 xwib8y2 x1sxyh0 xurb0ha x1y1aw1k"
		);
		let button = moreUI[moreUI.length - 1];
		await delay(25);
		let unsendOrReport = button.querySelector("span").getElementsByClassName("x1lliihq x193iq5w x6ikm8r x10wlt62 xlyipyv xuxw1ft");

		if (unsendOrReport[0].innerText === "Unsend") {
			// (4)
			button.click();
			await delay(75);
			document
				.getElementsByClassName(
					"xjbqb8w x1qhh985 xcfux6l xm0m39n x1yvgwvq x13fuv20 x178xt8z x1ypdohk xvs91rp x1evy7pa xdj266r x11i5rnm xat24cr x1mh8g0r x1wxaq2x x1iorvi4 x1sxyh0 xjkvuk6 xurb0ha x2b8uid x87ps6o xxymvpz xh8yej3 x52vrxo x4gyw5p xkmlbd1 x1xlr1w8"
				)[0]
				.click();
		} else {
			// focus thhe conversation
			conversation.click();
			await delay(50);
			await deleteReaction(lastMessage);
		}
		if (!scrolled) conversationWindow.scrollBy(0, -30);
	}
}

// deletes a reaction from ONE message
async function deleteReaction(lastMessage) {
	try {
		if (delReact) {
			// we check if message has a reaction on it
			let checkReaction = lastMessage.getElementsByClassName(
				"x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz"
			);
			if (checkReaction.length > 0) {
				reaction = checkReaction[0];
				reaction.click();
				await delay(25);
				// let popupConfirmation = document.querySelectorAll('[role="dialog"]');
				let popupConfirmation = document.getElementsByClassName(
					"x1ja2u2z x1afcbsf x1a2a7pz x6ikm8r x10wlt62 x71s49j x6s0dn4 x78zum5 xdt5ytf xl56j7k x1n2onr6"
				);
				popupConfirmation = popupConfirmation[popupConfirmation.length - 1];
				let spans = popupConfirmation.getElementsByClassName(
					"x1lliihq x1plvlek xryxfnj x1n2onr6 x1ji0vk5 x18bv5gf x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x1i0vuye xvs91rp xo1l8bm x1roi4f4 x1tu3fi x3x7a5m x10wh9bi x1wdrske x8viiok x18hxmgj"
				);
				// spans could be empty in the case that other people liked a message, but not the current user
				if (spans.length > 0) {
					spans[spans.length - 1].click();
					await delay(25);
				}

				let close = popupConfirmation.querySelector('[aria-label="Close"]');
				if (close) close.click();
				await delay(25);
			}
		}
	} catch {
		deleteReaction(lastMessage);
	}
}

async function deleteChat() {
	try {
		while (del) {
			let conversation = document.getElementsByClassName(
				"x1uipg7g xu3j5b3 xol2nv xlauuyb x26u7qi x19p7ews x78zum5 xdt5ytf x1iyjqo2 x6ikm8r x10wlt62"
			)[0];
			let messages = conversation.querySelectorAll('[data-release-focus-from="CLICK"]');
			await deleteMessages(conversation, messages); // wait for each message to be deleted before continuing

			let conversationWindow = document.getElementsByClassName(
				"x78zum5 xdt5ytf x1iyjqo2 xs83m0k x1xzczws x6ikm8r x1rife3k x1n2onr6 xh8yej3 x16o0dkt"
			)[1];
			// Check if we are at the top of the conversation
			if (conversationWindow.scrollTop <= 1) {
				break;
			}
		}
	} catch {
		deleteChat();
	}
}
