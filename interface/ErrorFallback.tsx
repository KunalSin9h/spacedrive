import { captureException } from '@sentry/browser';
import { FallbackProps } from 'react-error-boundary';
import { useRouteError } from 'react-router';
import { useDebugState } from '@sd/client';
import { Button } from '@sd/ui';
import { useOperatingSystem } from './hooks';

export function RouterErrorBoundary() {
	const error = useRouteError();
	return (
		<ErrorPage
			message={(error as any).toString()}
			sendReportBtn={() => {
				captureException(error);
				location.reload();
			}}
			reloadBtn={() => {
				location.reload();
			}}
		/>
	);
}

export default ({ error, resetErrorBoundary }: FallbackProps) => (
	<ErrorPage
		message={`Error: ${error.message}`}
		sendReportBtn={() => {
			captureException(error);
			resetErrorBoundary();
		}}
		reloadBtn={resetErrorBoundary}
	/>
);

export function ErrorPage({
	reloadBtn,
	sendReportBtn,
	message,
	submessage
}: {
	reloadBtn?: () => void;
	sendReportBtn?: () => void;
	message: string;
	submessage?: string;
}) {
	const debug = useDebugState();
	const os = useOperatingSystem();
	const isMacOS = os === 'macOS';

	if (!submessage && debug.enabled)
		submessage = 'Check the console (CMD/CTRL + OPTION + i) for stack trace.';

	return (
		<div
			data-tauri-drag-region
			role="alert"
			className={
				'flex h-screen w-screen flex-col items-center justify-center border border-app-divider bg-app p-4' +
				(isMacOS ? ' rounded-lg' : '')
			}
		>
			<p className="m-3 text-sm font-bold text-ink-faint">APP CRASHED</p>
			<h1 className="text-2xl font-bold text-ink">We're past the event horizon...</h1>
			<pre className="m-2 text-ink">{message}</pre>
			{submessage && <pre className="m-2 text-sm text-ink-dull">{submessage}</pre>}
			<div className="flex flex-row space-x-2 text-ink">
				{reloadBtn && (
					<Button variant="accent" className="mt-2" onClick={reloadBtn}>
						Reload
					</Button>
				)}
				{sendReportBtn && (
					<Button variant="gray" className="mt-2" onClick={sendReportBtn}>
						Send report
					</Button>
				)}
				{message === 'failed to initialize config' && (
					<div className="flex flex-col items-center pt-12">
						<p className="text-md max-w-[650px] text-center">
							We detected you may have created your library with an older version of
							Spacedrive. Please reset it to continue using the app!
						</p>
						<p className="mt-3 font-bold">
							{' '}
							YOU WILL LOSE ANY EXISTING SPACEDRIVE DATA!
						</p>
						<Button
							variant="colored"
							className="max-w-xs mt-4 bg-red-500 border-transparent"
							onClick={() => {
								// @ts-expect-error
								window.__TAURI_INVOKE__('reset_spacedrive');
							}}
						>
							Reset Library
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
