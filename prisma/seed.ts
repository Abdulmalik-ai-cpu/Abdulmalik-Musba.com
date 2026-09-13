import { PrismaClient, PublishStatus } from '@prisma/client';

const prisma = new PrismaClient();

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

  // Bootstrap the super admin account (no password hash — the auth service
  // permits a first-login fallback using the configured JWT secret; the admin
  // must set a real password via the profile / change-password flow).
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@abdulmalik-musba.com';
  const admin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        role: 'SUPER_ADMIN',
      },
    });
    console.log(`Seeded bootstrap admin (${adminEmail}) — set a password via the portal or change-password endpoint.`);
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());