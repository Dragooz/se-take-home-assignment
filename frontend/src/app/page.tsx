"use client";
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

const MainOrderPage = () => {
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
                // console.log("pendingOrder: ", pendingOrder);
                const updatedBot = assignOrderToBot(bot, pendingOrder);
                // console.log("updatedBot: ", updatedBot);
                return {
                    bot: updatedBot,
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
            let updatedBots = [...bots];

            updatedBots = updatedBots.map((bot) => {
                const result = updateBot(bot, updatedOrders);
                updatedOrders = result.orders;
                return result.bot;
            });

            setOrders(updatedOrders);
            setBots(updatedBots);
        }, 100);

        return () => clearInterval(interval);
    }, [orders, bots]);

    // console.log("bots: ", bots);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-5xl font-bold mb-8 text-center">
                McDonald Order Management
            </h1>
            <div className="mb-8 flex flex-wrap justify-center space-x-4">
                <button
                    onClick={() => addOrder(false)}
                    className="bg-yellow-400 text-red-600 font-bold py-2 px-4 rounded hover:bg-yellow-500 transition duration-300 mb-2 sm:mb-0"
                >
                    New Normal Order
                </button>
                <button
                    onClick={() => addOrder(true)}
                    className="bg-yellow-400 text-red-600 font-bold py-2 px-4 rounded hover:bg-yellow-500 transition duration-300 mb-2 sm:mb-0"
                >
                    New VIP Order
                </button>
                <button
                    onClick={addBot}
                    className="bg-yellow-400 text-red-600 font-bold py-2 px-4 rounded hover:bg-yellow-500 transition duration-300 mb-2 sm:mb-0"
                >
                    + Bot
                </button>
                <button
                    onClick={() => removeBot()}
                    className="bg-yellow-400 text-red-600 font-bold py-2 px-4 rounded hover:bg-yellow-500 transition duration-300 mb-2 sm:mb-0"
                >
                    - Bot
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                <div className="bg-white rounded-lg p-4 shadow-lg h-[500px] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4 text-red-600 sticky top-0 bg-white">
                        Pending Orders
                    </h2>
                    <div className="space-y-2">
                        {orders
                            .filter((order) => order.status === "PENDING")
                            .map((order) => (
                                <div
                                    key={order.id}
                                    className={`p-2 rounded ${
                                        order.isVIP
                                            ? "bg-yellow-200"
                                            : "bg-gray-100"
                                    } text-black`}
                                >
                                    <span className="font-semibold">
                                        Order #{order.id}
                                    </span>
                                    {order.isVIP && (
                                        <span className="ml-2 text-yellow-600 font-bold">
                                            (VIP)
                                        </span>
                                    )}
                                    {order.isProcessing && (
                                        <span className="ml-2 text-blue-600">
                                            (Processing by Bot #
                                            {
                                                bots.find(
                                                    (bot) =>
                                                        bot.order?.id ===
                                                        order.id
                                                )?.id
                                            }
                                            )
                                        </span>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg h-[500px] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4 text-red-600 sticky top-0 bg-white">
                        Complete Orders
                    </h2>
                    <div className="space-y-2">
                        {orders
                            .filter((order) => order.status === "COMPLETE")
                            .map((order) => (
                                <div
                                    key={order.id}
                                    className={`p-2 rounded ${
                                        order.isVIP
                                            ? "bg-yellow-200"
                                            : "bg-gray-100"
                                    } text-black`}
                                >
                                    <span className="font-semibold">
                                        Order #{order.id}
                                    </span>
                                    {order.isVIP && (
                                        <span className="ml-2 text-yellow-600 font-bold">
                                            (VIP)
                                        </span>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg h-[500px] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4 text-red-600 sticky top-0 bg-white">
                        Bots
                    </h2>
                    <div className="space-y-2">
                        {bots.map((bot) => (
                            <div
                                key={bot.id}
                                className="p-2 bg-gray-100 rounded text-black"
                            >
                                <span className="font-semibold">
                                    Bot #{bot.id}:
                                </span>{" "}
                                {bot.order ? (
                                    <span>
                                        Processing Order #{bot.order.id}{" "}
                                        <span className="text-blue-600">
                                            ({bot.progressSeconds.toFixed(1)}
                                            s)
                                        </span>
                                    </span>
                                ) : (
                                    <span className="text-green-600">Idle</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainOrderPage;
