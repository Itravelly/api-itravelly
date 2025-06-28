import { DataSource } from 'typeorm';
import { bookingStatusSeeder } from '../../modules/bookings/seeds/booking-status.seeder';
import { paymentStatusSeeder } from '../../modules/bookings/seeds/payment-status.seeder';
import { roleSeeder } from '../../modules/users/seeds/role.seeder';

// Configuración directa para seeders con credenciales específicas
const dataSourceConfig = {
  type: 'postgres' as const,
  host: 'dpg-d1bs5n95pdvs73e6dg70-a.oregon-postgres.render.com',
  port: 5432,
  username: 'itv_superadmin',
  password: 'bvIR7c3IJY2bRQUHESXUC5hUUczj2lIK',
  database: 'dbitravelly_01mq',
  entities: [
    __dirname + '/../../**/*.entity{.ts,.js}',
  ],
  synchronize: false, // No sincronizar en seeders
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

async function runSeeds() {
  const dataSource = new DataSource(dataSourceConfig);

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    console.log('\n=== Running Seeds ===\n');

    // Run booking status seeder
    console.log('Running Booking Status Seeder...');
    await bookingStatusSeeder(dataSource);
    console.log('✅ Booking Status Seeder completed\n');

    // Run payment status seeder
    console.log('Running Payment Status Seeder...');
    await paymentStatusSeeder(dataSource);
    console.log('✅ Payment Status Seeder completed\n');

    // Run role seeder
    console.log('Running Role Seeder...');
    await roleSeeder(dataSource);
    console.log('✅ Role Seeder completed\n');

    console.log('🎉 All seeds completed successfully!');

  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

runSeeds(); 