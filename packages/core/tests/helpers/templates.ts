export const shortTemplate = {
  template: `<@user:name->trim@>[( John )], <@test:value->test@>>!`,
  metadata: {
    user: {
      name: "Jose",
    },
  },
};

export const mediumTemplate = {
  template: `Hello <<@user:firstName->trim->capitalize@>>[(Friend)],
Your order <<@order:id@>> was shipped to <<@order:address.line1->trim@>>.
Total: <<@order:total->formatCurrency@>>.
Payment method: <<@order:payment.method@>>.
Delivery date: <<@order:deliveryDate->formatDate@>>.
If you have any questions, reply to this message or call <<@company:phone@>>.
Thank you for choosing us 💙
`.trim(),
  metadata: {
    user: { firstName: "jhon" },
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
