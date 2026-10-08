import 'dotenv/config';
import { PrismaClient, PublishStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Generate a strong random password that satisfies the login schema
 * (min 8 chars) and common password policies.
 */
function generatePassword(length = 24): string {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+?';
  let password = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += alphabet[bytes[i] % alphabet.length];
  }
  return password;
}

/**
 * Seed script — only system configuration and taxonomy defaults.
 * Per the master prompt (§140.39), never seed fake professional history into production.
 * The Super Admin must populate real identity/portfolio content through the Admin Portal.
 */
async function main() {
  // Bootstrap default site settings.
  const existing = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
  if (!existing) {
    await prisma.siteSetting.create({
      data: {
        id: 'default',
        siteName: 'Abdulmalik Musba',
        tagline: 'Personal Portfolio & Digital Legacy Platform',
        footerText: '© {year} Abdulmalik Musba. Built for a lifetime of work.',
        theme: 'dark',
      },
    });
    console.log('Seeded default SiteSetting');
  }

  // Bootstrap default SEO configuration.
  const seo = await prisma.seoConfig.findUnique({ where: { id: 'default' } });
  if (!seo) {
    await prisma.seoConfig.create({
      data: {
        id: 'default',
        siteTitle: 'Abdulmalik Musba — Personal Portfolio',
        description: 'Personal portfolio, research, projects, publications, and writing by Abdulmalik Musba.',
        keywords: ['portfolio', 'research', 'engineering', 'writing'],
      },
    });
    console.log('Seeded default SeoConfig');
  }

  // Bootstrap default navigation (mirrors the public-site information architecture).
  const navCount = await prisma.navItem.count();
  if (navCount === 0) {
    await prisma.navItem.createMany({
      data: [
        { label: 'Home', href: '/', order: 0 },
        { label: 'About', href: '/about', order: 1 },
        { label: 'Education', href: '/education', order: 2 },
        { label: 'Experience', href: '/experience', order: 3 },
        { label: 'Research', href: '/research', order: 4 },
        { label: 'Projects', href: '/projects', order: 5 },
        { label: 'Publications', href: '/publications', order: 6 },
        { label: 'Skills', href: '/skills', order: 7 },
        { label: 'Achievements', href: '/achievements', order: 8 },
        { label: 'Articles', href: '/articles', order: 9 },
        { label: 'Contact', href: '/contact', order: 10 },
      ],
    });
    console.log('Seeded default navigation');
  }

  // Bootstrap the super admin account with genuine login credentials.
  //
  // Recommended practice: the password is hashed with bcrypt and stored only as
  // a hash — never in plaintext. Credentials are configurable via ADMIN_EMAIL /
  // ADMIN_PASSWORD so a real deployment can provision its own secret without
  // editing source, and a strong random password is generated as a safe default.
  // The seed prints the generated credentials once; set ADMIN_EMAIL / ADMIN_PASSWORD
  // explicitly (or rotate the password after first login) in production.
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@abdulmalik-musba.com').toLowerCase().trim();
  const generatedPassword = process.env.ADMIN_PASSWORD ?? generatePassword();
  const passwordHash = await hash(generatedPassword, 12);

  const admin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        role: 'SUPER_ADMIN',
        passwordHash,
      },
    });
    console.log(`Seeded super admin (${adminEmail}).`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD ? '(set via ADMIN_PASSWORD)' : generatedPassword}`);
    console.log('  Change it after first login via the change-password endpoint.');
  } else {
    // Upgrade path: previous bootstrap accounts had no hash and relied on the
    // JWT-secret fallback. Ensure a real bcrypt hash is set.
    if (!admin.passwordHash) {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { passwordHash },
      });
      console.log(`Set a genuine password hash for existing admin (${adminEmail}).`);
      console.log(`  Password: ${process.env.ADMIN_PASSWORD ? '(set via ADMIN_PASSWORD)' : generatedPassword}`);
      console.log('  Change it after first login via the change-password endpoint.');
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());