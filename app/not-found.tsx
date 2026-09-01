import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-24">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">404</h1>
				<p className="text-lg text-gray-600 mb-6">Page not found.</p>
				<div className="space-x-2">
					<Link href="/" className="inline-block px-4 py-2 bg-zak-black text-white rounded-md">
						Go back home
					</Link>
				</div>
			</div>
		</div>
	);
}
