import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: "/api/payments",
        method: "post",
        body: {
            orderId: order.id,
        },
        // redirect to list of orders
        onSuccess: () => Router.push("/orders"),
    });

    useEffect(() => {
        const findTimeLeft = () => {
            // calculate time left to expiration
            const msLeft = new Date(order.expiresAt) - new Date();
            // round to minutes
            setTimeLeft(Math.round(msLeft / 1000));
        };

        // call function for the first time
        findTimeLeft();

        // call function every second
        // setInterval returns an id that can be used to clear the interval
        const timerId = setInterval(findTimeLeft, 1000);

        // clear interval when component is no longer visible
        return () => {
            clearInterval(timerId);
        };
    }
        , [order]);

    if (timeLeft < 0) {
        return <div>Order Expired</div>;
    }

    return (
        <div>
            Time left to pay: {timeLeft} seconds
            <StripeCheckout
                // token is a callback function that will be called after the user submits the form
                token={({ id }) => doRequest({ token: id })}
                // should be env variable/kubernetes secret
                stripeKey="pk_test_51Omj5KLjFhOwZdrVm3JrzVoFn9dggpJpPltBblIl1N8z0QlsV0g7SfvVe5S8H66DypiaTNF11Kc87dQNvDdEcuBd002dJA7xfQ"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );
}

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
};

export default OrderShow;