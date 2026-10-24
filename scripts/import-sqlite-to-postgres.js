/**
 * Safe Migration Script: Import data from SQLite backup (JSON) into PostgreSQL via Prisma.
 * Preserves all IDs, relationships, dates, and JSON strings.
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigration() {
  const backupFilePath = path.join(__dirname, '..', 'prisma', 'sqlite_backup_data.json');
  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Backup file not found at: ${backupFilePath}`);
  }

  console.log('Reading SQLite backup data...');
  const data = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));

  console.log(`Found:
  - Users: ${data.users?.length || 0}
  - Products: ${data.products?.length || 0}
  - Reviews: ${data.reviews?.length || 0}
  - Orders: ${data.orders?.length || 0}
  - OrderItems: ${data.orderItems?.length || 0}
  - ContactInquiries: ${data.contactInquiries?.length || 0}
  - Inspections: ${data.inspections?.length || 0}
  - InspectionVersions: ${data.inspectionVersions?.length || 0}
  - InspectionAuditLogs: ${data.inspectionAuditLogs?.length || 0}
  - InspectionMeasurements: ${data.inspectionMeasurements?.length || 0}
  - InspectionPhotos: ${data.inspectionPhotos?.length || 0}
  - InspectionDefects: ${data.inspectionDefects?.length || 0}
  - InspectionTemplates: ${data.inspectionTemplates?.length || 0}
  `);

  console.log('Starting transaction import...');

  // 1. Users
  for (const user of (data.users || [])) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        ...user,
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }
  console.log('Users imported.');

  // 2. Products
  for (const product of (data.products || [])) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      },
    });
  }
  console.log('Products imported.');

  // 3. Reviews
  for (const review of (data.reviews || [])) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: {},
      create: {
        ...review,
        createdAt: new Date(review.createdAt),
      },
    });
  }
  console.log('Reviews imported.');

  // 4. Orders
  for (const order of (data.orders || [])) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: {},
      create: {
        ...order,
        estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : null,
        shippedAt: order.shippedAt ? new Date(order.shippedAt) : null,
        deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
        cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : null,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      },
    });
  }
  console.log('Orders imported.');

  // 5. OrderItems
  for (const item of (data.orderItems || [])) {
    await prisma.orderItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }
  console.log('Order items imported.');

  // 6. Contact Inquiries
  for (const inquiry of (data.contactInquiries || [])) {
    await prisma.contactInquiry.upsert({
      where: { id: inquiry.id },
      update: {},
      create: {
        ...inquiry,
        createdAt: new Date(inquiry.createdAt),
      },
    });
  }
  console.log('Contact inquiries imported.');

  // 7. Inspections
  for (const inspection of (data.inspections || [])) {
    await prisma.inspection.upsert({
      where: { id: inspection.id },
      update: {},
      create: {
        ...inspection,
        finalizedAt: inspection.finalizedAt ? new Date(inspection.finalizedAt) : null,
        createdAt: new Date(inspection.createdAt),
        updatedAt: new Date(inspection.updatedAt),
      },
    });
  }
  console.log('Inspections imported.');

  // 8. InspectionVersions
  for (const version of (data.inspectionVersions || [])) {
    await prisma.inspectionVersion.upsert({
      where: { id: version.id },
      update: {},
      create: {
        ...version,
        createdAt: new Date(version.createdAt),
      },
    });
  }
  console.log('Inspection versions imported.');

  // 9. InspectionAuditLogs
  for (const log of (data.inspectionAuditLogs || [])) {
    await prisma.inspectionAuditLog.upsert({
      where: { id: log.id },
      update: {},
      create: {
        ...log,
        timestamp: new Date(log.timestamp),
      },
    });
  }
  console.log('Inspection audit logs imported.');

  // 10. InspectionMeasurements
  for (const m of (data.inspectionMeasurements || [])) {
    await prisma.inspectionMeasurement.upsert({
      where: { id: m.id },
      update: {},
      create: m,
    });
  }
  console.log('Inspection measurements imported.');

  // 11. InspectionPhotos
  for (const photo of (data.inspectionPhotos || [])) {
    await prisma.inspectionPhoto.upsert({
      where: { id: photo.id },
      update: {},
      create: photo,
    });
  }
  console.log('Inspection photos imported.');

  // 12. InspectionDefects
  for (const defect of (data.inspectionDefects || [])) {
    await prisma.inspectionDefect.upsert({
      where: { id: defect.id },
      update: {},
      create: defect,
    });
  }
  console.log('Inspection defects imported.');

  // 13. InspectionTemplates
  for (const template of (data.inspectionTemplates || [])) {
    await prisma.inspectionTemplate.upsert({
      where: { id: template.id },
      update: {},
      create: {
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
      },
    });
  }
  console.log('Inspection templates imported.');

  console.log('All SQLite data successfully imported to target database!');
}

runMigration()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
