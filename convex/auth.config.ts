const siteUrl =
	process.env.CONVEX_SITE_URL ?? process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

if (!siteUrl) {
	throw new Error(
		"Missing CONVEX_SITE_URL (or NEXT_PUBLIC_CONVEX_SITE_URL) for Convex auth config.",
	);
}

const authConfig = {
	providers: [
		{
			domain: siteUrl,
			applicationID: "convex",
		},
	],
};

export default authConfig;
