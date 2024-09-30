# How to run

1. Clone down & npm run dev

## Roadmap

1. Order List (base)

-   Status: string > "PENDING" / "COMPLETE"
-   isProcessing: boolean
-   isVIP: boolean (simpler than maintaining two list, do this approach for now and see)
-   Write a logic to insert accordingly

2. Bot List

-   order: Order instance
-   progressSecond: Increment by one each
-   If order is null, then status is "IDLE"

3. Newly added Bot

-   Add the bot in queue

4. Remove bot

-   Release the order
-   Remove the bot from list

Methods:

1. UseEffect to check the bot every second

-   Check if the bot have order & reach the threshold
    > If have order
    >
    > > If processing time threshold reach, update the order instance to "COMPLETE" + release the bot from order.
    > > If processing time threshold not reach, do nothing
    > > If don't have order
    > > Check if any order is in PENDING
    > >
    > > > If yes, attach the order to the bot
    > > > If no, do nothing
