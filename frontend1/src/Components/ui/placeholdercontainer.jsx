import React from "react";
import Placeholder from "./Placeholder";

const PlaceholderContainer = () => {
  const placeholders = [...Array(12).keys()];

  return (
    <section className="py-5">
      <h4 style={{ textAlign: "center" }}>Loading Products...</h4>

      <div className="container px-4 px-lg-5 mt-5">
        <div className="row justify-content-center">
          {placeholders.map((num) => (
            <Placeholder key={num} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlaceholderContainer;