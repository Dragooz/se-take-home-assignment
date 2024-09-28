import React, { useState, useEffect } from "react";

interface Order {
    id: string;
    status: "PENDING" | "COMPLETE";
    isProcessing: boolean;
    isVIP: boolean;
}

interface Bot {
    id: string;
    order: Order | null;
    progressSeconds: number;
}

const ORDER_PROCESSING_TIME_REQUIRED = 10; // seconds

const OrderPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [bots, setBots] = useState<Bot[]>([]);

    // Function to add a new order
    const addOrder = (isVIP: boolean) => {
        // Define a new order here
        const newOrder: Order = {
            id: (orders.length + 1).toString(), // Generate a unique and sequential ID
            status: "PENDING",
            isProcessing: false,
            isVIP: isVIP,
        };

        setOrders((prevOrders) => {
            // Logic to insert VIP orders before other VIP orders, and normal orders at the end
            if (newOrder.isVIP) {
                const lastVipIndex = prevOrders.findLastIndex(
                    (order) => order.isVIP
                );
                if (lastVipIndex === -1) {
                    // No VIP orders, insert at the beginning
                    return [newOrder, ...prevOrders];
                } else {
                    // Insert after the last VIP order
                    return [
                        ...prevOrders.slice(0, lastVipIndex + 1),
                        newOrder,
                        ...prevOrders.slice(lastVipIndex + 1),
                    ];
                }
            } else {
                // For normal orders, add to the end
                return [...prevOrders, newOrder];
            }
        });
    };

    // Function to add a new bot
    const addBot = () => {
        const pendingOrder = orders.find(
            (order) => order.status === "PENDING" && !order.isProcessing
        );
        const newBot: Bot = {
            id: `bot-${bots.length + 1}`,
            order: pendingOrder || null,
            progressSeconds: 0,
        };

        setBots((prevBots) => [...prevBots, newBot]);

        if (pendingOrder) {
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === pendingOrder.id
                        ? { ...order, isProcessing: true }
                        : order
                )
            );
        }
    };

    // Function to remove a bot
    const removeBot = () => {
        setBots((prevBots) => {
            if (prevBots.length === 0) {
                return prevBots; // No bots to remove
            }

            const newestBot = prevBots[prevBots.length - 1];

            if (newestBot.order) {
                setOrders((prevOrders) => {
                    return prevOrders.map((order) => {
                        if (order.id === newestBot.order?.id) {
                            return {
                                ...order,
                                isProcessing: false,
                                status: "PENDING",
                            };
                        }
                        return order;
                    });
                });
            }

            return prevBots.slice(0, -1); // Remove the last bot
        });
    };

    // Use Effect
    const findPendingOrder = (orders: Order[]): Order | undefined => {
        return orders.find(
            (order) => order.status === "PENDING" && !order.isProcessing
        );
    };

    const assignOrderToBot = (bot: Bot, pendingOrder: Order): Bot => {
        return {
            ...bot,
            order: pendingOrder,
            progressSeconds: 0,
        };
    };

    const updateOrderStatus = (
        orders: Order[],
        orderId: string,
        isProcessing: boolean
    ): Order[] => {
        return orders.map((order) =>
            order.id === orderId
                ? { ...order, isProcessing: isProcessing }
                : order
        );
    };

    const processOrder = (
        bot: Bot,
        orders: Order[]
    ): { bot: Bot; orders: Order[] } => {
        const updatedProgressSeconds = bot.progressSeconds + 0.1;

        if (updatedProgressSeconds >= ORDER_PROCESSING_TIME_REQUIRED) {
            const updatedOrders = updateOrderStatus(
                orders,
                bot.order?.id || "",
                false
            ).map((order) =>
                order.id === bot.order?.id
                    ? { ...order, status: "COMPLETE" }
                    : order
            );

            return {
                bot: { ...bot, order: null, progressSeconds: 0 },
                orders: updatedOrders as Order[],
            };
        }

        return {
            bot: { ...bot, progressSeconds: updatedProgressSeconds },
            orders,
        };
    };

    const updateBot = (
        bot: Bot,
        orders: Order[]
    ): { bot: Bot; orders: Order[] } => {
        if (!bot.order) {
            const pendingOrder = findPendingOrder(orders);
            if (pendingOrder) {
                return {
                    bot: assignOrderToBot(bot, pendingOrder),
                    orders: updateOrderStatus(orders, pendingOrder.id, true),
                };
            }
        } else {
            return processOrder(bot, orders);
        }
        return { bot, orders };
    };

    useEffect(() => {
        const interval = setInterval(() => {
            let updatedOrders = [...orders];

            setBots((prevBots) =>
                prevBots.map((bot) => {
                    const result = updateBot(bot, updatedOrders);
                    updatedOrders = result.orders;
                    setOrders(updatedOrders);
                    return result.bot;
                })
            );
        }, 100);

        return () => clearInterval(interval);
    }, [orders, bots]);

    return (
        <div>
            <h1>Order Management</h1>
            <div className="controls">
                <button onClick={() => addOrder(false)}>
                    New Normal Order
                </button>
                <button onClick={() => addOrder(true)}>New VIP Order</button>
                <button onClick={addBot}>+ Bot</button>
                <button onClick={() => removeBot()}>- Bot</button>
            </div>
            <div className="order-lists">
                <div className="pending-orders">
                    <h2>Pending Orders</h2>
                    {orders
                        .filter((order) => order.status === "PENDING")
                        .map((order) => (
                            <div
                                key={order.id}
                                className={`order ${order.isVIP ? "vip" : ""}`}
                            >
                                Order #{order.id} {order.isVIP ? "(VIP)" : ""}{" "}
                                {order.isProcessing
                                    ? `(Processing by Bot #${
                                          bots.find(
                                              (bot) =>
                                                  bot.order?.id === order.id
                                          )?.id
                                      })`
                                    : ""}
                            </div>
                        ))}
                </div>
                <div className="complete-orders">
                    <h2>Complete Orders</h2>
                    {orders
                        .filter((order) => order.status === "COMPLETE")
                        .map((order) => (
                            <div
                                key={order.id}
                                className={`order ${order.isVIP ? "vip" : ""}`}
                            >
                                Order #{order.id} {order.isVIP ? "(VIP)" : ""}
                            </div>
                        ))}
                </div>
            </div>
            <div className="bots">
                <h2>Bots</h2>
                {bots.map((bot) => (
                    <div key={bot.id} className="bot">
                        Bot #{bot.id}:{" "}
                        {bot.order
                            ? `Processing Order #${
                                  bot.order.id
                              } (${bot.progressSeconds.toFixed(1)}s)`
                            : "Idle"}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderPage;
