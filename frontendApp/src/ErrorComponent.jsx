import React from "react";

const ErrorComponent = (props) => {
  console.error("Error Encountered", props.error);

  return (
    <div>
      <h1>Error encountered</h1>
      <br />
      Error message: {props.error.message}
    </div>
  );
};

export default ErrorComponent;
