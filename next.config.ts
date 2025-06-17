import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.schoology.com",
				port: "",
				pathname: "/**",
			},
		],
	},
	experimental: {
		reactCompiler: true,
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
};

export default nextConfig;
