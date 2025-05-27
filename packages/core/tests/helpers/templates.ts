export const shortTemplate = {
  template: `<@user:name->trim@>[( Randy )], <@test:value->test@>>!`,
  metadata: {
    user: {
      name: "Jose",
    },
  },
};

export const mediumTemplate = {
  template: `Hola <<@user:firstName->trim->capitalize@>>[(Amigo)], 
Tu pedido <<@order:id@>> fue enviado a <<@order:address.line1->trim@>>.
Total: <<@order:total->formatCurrency@>>.
Método de pago: <<@order:payment.method@>>.
Fecha de entrega: <<@order:deliveryDate->formatDate@>>.
Si tienes dudas, responde a este mensaje o llama al <<@company:phone@>>.
Gracias por elegirnos 💙
`.trim(),
  metadata: {
    user: { firstName: "randy" },
    order: {
      id: "#123456",
      address: { line1: " Calle Principal 123 " },
      total: 199.99,
      payment: { method: "Tarjeta de crédito" },
      deliveryDate: "2025-06-01T00:00:00Z",
    },
    company: {
      phone: "+1 809 555 1234",
    },
  },
};
