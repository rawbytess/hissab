import React from "react";
import Layout from "@theme/Layout";

export default function RefundPolicy() {
  return (
    <Layout title="Hello" description="Hello React Page">
      <div className="p-20 policies">
        <h1>Refund policy</h1>
        <p>
          Since the Service offers non-tangible, irrevocable goods we do not
          provide refunds after the product is purchased, which you acknowledge
          prior to purchasing any product on the Services. Please make sure that
          you’ve carefully read product description before making a purchase.
        </p>
        <h2>Contacting us</h2>
        <p>
          If you have any questions, concerns, or complaints regarding this
          refund policy, we encourage you to contact us using the details below:
        </p>
        <p>support@hissab.io</p>
        <p>This document was last updated on February 12, 2022</p>
      </div>
    </Layout>
  );
}
