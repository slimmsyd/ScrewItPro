import type { NextConfig } from "next";

/**
 * Temporary redirects: old portal URLs → /customer/* (Slice 2.1).
 * permanent: false so we can remove after one release.
 * Config redirects run before middleware → return_to sees canonical path.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/jobs", destination: "/customer/jobs", permanent: false },
      { source: "/jobs/:path*", destination: "/customer/jobs/:path*", permanent: false },
      { source: "/account", destination: "/customer/account", permanent: false },
      {
        source: "/account/:path*",
        destination: "/customer/account/:path*",
        permanent: false,
      },
      {
        source: "/notifications",
        destination: "/customer/notifications",
        permanent: false,
      },
      {
        source: "/notifications/:path*",
        destination: "/customer/notifications/:path*",
        permanent: false,
      },
      {
        source: "/referrals",
        destination: "/customer/referrals",
        permanent: false,
      },
      {
        source: "/referrals/:path*",
        destination: "/customer/referrals/:path*",
        permanent: false,
      },
      {
        source: "/orders/:id",
        destination: "/customer/orders/:id",
        permanent: false,
      },
      {
        source: "/orders/:id/track",
        destination: "/customer/orders/:id/track",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
