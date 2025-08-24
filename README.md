# InstaPurge - Rapid Mass Instagram DM Deletion Script

## About

**InstaPurge** is an extremely fast script designed to delete all Instagram messages in a conversation, directly from your browser's Developer Tools console. It ensures that both messages and reactions are wiped, leaving no trace of your existence in the conversation. It is highly recommended to load the entire chat before running the deletion process. This is the best way to delete your Instagram messages as all other methods are outdated and no longer work, and Instagram itself does not expose an API to automatically delete messages on the server side. Hence, we must use this script on the client side console to accomplish this.

## Features

-   **Mass Message and Reaction Deletion**: Deletes all messages and reactions (if enabled) in a conversation from the bottom of the viewport to the top.
-   **Load Entire Chat**: Use the `loadChat()` function to fully load the conversation to ensure no messages are missed.
-   **Selective Deletion**: Use flags to control deletion:
    -   **`del`**: Controls message deletion.
    -   **`delReact`**: Controls reaction deletion.
-   **Rapid Execution**: This script runs extremely fast and efficiently deletes both messages and reactions.

## How to Use

1. **Open Instagram on your browser** and navigate to the conversation you want to clean.
2. **Open Developer Tools**: Right-click anywhere on the page and select **Inspect**, then go to the **Console** tab.
3. **Paste the Script**: Copy and paste the InstaPurge script into the console and press **Enter** to run it.

By default, the script loads the entire conversation first and then begins to delete every message and reaction from the very bottom of the conversation.

### Key Flags

-   **`load (boolean)`**: When set to `false`, the `loadChat()` function will stop loading the conversation.
-   **`del (boolean)`**: When set to `false`, the `deleteChat()` function will stop deleting messages. Set `del = true` to resume.
-   **`delReact (boolean)`**: When set to `false`, reaction deletion will be skipped. This is useful when the other user has blocked you, preventing reaction removal.

### Recommended Steps

1. To load the entire chat:

    ```js
    load = true;
    loadChat();
    ```

2. To stop loading the chat (alternatively wait for the script to reach the very top of the converation):

    ```js
    load = false;
    ```

3. To start deleting messages:

    ```js
    del = true;
    deleteChat();
    ```

4. To stop deleting messages:

    ```js
    del = false;
    ```

5. To start deleting reactions:

    ```js
    delReact = true;
    ```

6. To stop deleting reactions:
    ```js
    delReact = false;
    ```

## Important Notes

-   Blocked by the Other User: If you have been blocked by the other user, you may not be able to delete reactions. Set `delReact = false` in this case to skip reaction deletion.
-   The tab and script may start lagging if a huge chunk of the conversation has been loaded. This is normal, the script will work thoroughly and delete everything. In the case that it glitches out and pauses for longer than 30 seconds, simply run `deleteChat()` again.
-   You need to make sure that the tab is actively running for this script to continue working. If the process for the tab sleeps or gets terminated, the script will stop executing.

## Disclaimer

This script is provided for educational purposes. Please use it responsibly. The authors are not responsible for any actions taken using this script.

#### InstaPurge - The fastest Instagram DM cleaning tool, working as of 2025.
