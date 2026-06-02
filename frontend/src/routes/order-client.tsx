import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/order-client")({
  component: OrderClient,
});

function OrderClient() {
  return (
    <div>
      <h1>Order Client</h1>
      {/* Votre contenu ici */}
    </div>
  );
}