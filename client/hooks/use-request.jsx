import axios from "axios";
import { useState } from "react";

export default ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);
    // add props for the payment useCase, where we have to add token Id
    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            const response = await axios[method](url, { ...body, ...props });
            if (onSuccess) {
                onSuccess(response.data);
            }
            return response.data;
        } catch (err) {
            setErrors(
                <div className="alert alert-danger">
                    <h1>Oops</h1>
                    <ul className="my-0">
                        {err.response.data.errors.map(err => <li key={err.message}>{err.message}</li>)}
                    </ul>
                </div>)
        }
    };
    return { doRequest, errors }
};
