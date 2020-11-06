import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);

      const response = await axios[method](url, body);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      const errors = err.response.data.errors;

      setErrors(
        <div className="alert alert-danger">
          <h4>Oops...</h4>
          <url className="my-0">
            {errors.map((error) => (
              <li key={error.message}>{error.message}</li>
            ))}
          </url>
        </div>
      );
    }
  };

  return { doRequest, errors };
};

export default useRequest;
