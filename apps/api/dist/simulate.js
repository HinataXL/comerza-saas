"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./lib/prisma");
async function main() {
    const sale = await prisma_1.prisma.sale.findFirst({
        where: { status: 'PENDING', paymentMethod: 'Recurrente NFC' },
        orderBy: { createdAt: 'desc' }
    });
    if (!sale) {
        console.log('No pending NFC sales found');
        return;
    }
    console.log('Found pending sale:', sale.id);
    const res = await fetch('http://localhost:3001/api/webhooks/recurrente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event_type: 'payment_intent.succeeded',
            data: { external_id: sale.id }
        })
    });
    console.log('Webhook status:', res.status);
}
main()
    .catch(console.error)
    .finally(() => prisma_1.prisma.$disconnect());
