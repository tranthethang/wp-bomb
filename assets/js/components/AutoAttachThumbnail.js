import { useState, useEffect } from '@wordpress/element';
import {
	Button,
	PanelBody,
	TextControl,
	Notice,
	Spinner,
	ExternalLink,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

const AutoAttachThumbnail = () => {
	const [minId, setMinId] = useState('');
	const [maxId, setMaxId] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isFetchingStats, setIsFetchingStats] = useState(true);
	const [notice, setNotice] = useState(null);

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			const data = await apiFetch({
				path: '/wpbomb/v1/auto-attach-thumbnail/stats',
			});
			if (data.success) {
				setMinId(data.min_id);
				setMaxId(data.max_id);
			}
		} catch (error) {
			console.error('Failed to fetch stats', error);
		} finally {
			setIsFetchingStats(false);
		}
	};

	const handleExecute = async (e) => {
		e.preventDefault();

		if (
			!confirm(
				__(
					'Are you sure you want to attach thumbnails? This will set thumbnails for posts based on the specified ID range.',
					'wp-bomb'
				)
			)
		) {
			return;
		}

		setIsLoading(true);
		setNotice(null);

		try {
			const data = await apiFetch({
				path: '/wpbomb/v1/auto-attach-thumbnail/execute',
				method: 'POST',
				data: {
					min_id: parseInt(minId),
					max_id: parseInt(maxId),
				},
			});

			if (data.success) {
				setNotice({
					type: 'success',
					message: data.message,
				});
			}
		} catch (error) {
			setNotice({
				type: 'error',
				message:
					error.message || __('An error occurred during execution.', 'wp-bomb'),
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="wp-bomb-module mb-8">
			<div className="mb-6">
				<h2 className="text-2xl font-medium text-gray-800 mb-2">
					{__('Auto Attach Thumbnail', 'wp-bomb')}
				</h2>
				<p className="text-[13px] text-wp-sub leading-relaxed max-w-4xl">
					{__(
						'This module scans posts within the specified ID range and automatically attaches the first image found in the content as the featured image (thumbnail) if one is not already set.',
						'wp-bomb'
					)}
				</p>
			</div>

			{notice && (
				<Notice
					status={notice.type}
					onRemove={() => setNotice(null)}
					className="mb-4"
				>
					{notice.message}
				</Notice>
			)}

			<PanelBody className="bg-white border border-wp-border shadow-wp-card rounded-sm overflow-hidden p-0">
				<form onSubmit={handleExecute} className="p-6 space-y-6">
					{isFetchingStats ? (
						<div className="flex justify-center py-4">
							<Spinner />
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div className="space-y-2">
								<TextControl
									label={__('Min ID', 'wp-bomb')}
									type="number"
									value={minId}
									onChange={(value) => setMinId(value)}
									help={__('Starting post ID for the operation.', 'wp-bomb')}
									required
									min="0"
								/>
							</div>

							<div className="space-y-2">
								<TextControl
									label={__('Max ID', 'wp-bomb')}
									type="number"
									value={maxId}
									onChange={(value) => setMaxId(value)}
									help={__('Ending post ID for the operation.', 'wp-bomb')}
									required
									min="0"
								/>
							</div>
						</div>
					)}

					<div className="bg-gray-50 border-t border-wp-border px-6 py-4 flex items-center justify-end">
						<Button
							variant="primary"
							type="submit"
							isBusy={isLoading}
							disabled={isLoading}
							icon="controls-play"
							className="flex items-center gap-2"
						>
							{__('Execute', 'wp-bomb')}
						</Button>
					</div>
				</form>
			</PanelBody>
		</div>
	);
};

export default AutoAttachThumbnail;
