import type { TrackEventParams } from '$lib/types/analytics';
import Plausible from 'plausible-tracker';

const trackEventMock = vi.fn();
const enableAutoPageviews = vi.fn();

vi.mock('plausible-tracker', () => ({
	default: vi.fn(() => ({
		enableAutoPageviews,
		trackEvent: trackEventMock
	}))
}));

vi.doMock('$lib/constants/app.constants', () => ({
	PROD: true
}));

vi.doMock('$env/plausible.env', () => ({
	PLAUSIBLE_ENABLED: true,
	PLAUSIBLE_DOMAIN: 'test.com'
}));

describe('plausible analytics service', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it('should initialize Plausible with correct config', async () => {
		const { PLAUSIBLE_DOMAIN } = await import('$env/plausible.env');
		const { initPlausibleAnalytics } = await import('$lib/services/analytics.services');

		initPlausibleAnalytics();

		expect(Plausible).toHaveBeenCalledWith({
			domain: PLAUSIBLE_DOMAIN,
			hashMode: false,
			trackLocalhost: false
		});
	});

	it('should enable auto pageviews', async () => {
		const { initPlausibleAnalytics } = await import('$lib/services/analytics.services');

		expect(enableAutoPageviews).toHaveBeenCalledTimes(0);

		initPlausibleAnalytics();

		expect(enableAutoPageviews).toHaveBeenCalledTimes(1);
	});

	it('should call trackEvent if tracker is initialized', async () => {
		const { trackEvent, initPlausibleAnalytics } = await import('$lib/services/analytics.services');

		initPlausibleAnalytics();

		const params: TrackEventParams = {
			name: 'test_event_name',
			metadata: { eventName: 'eventValue' }
		};

		await trackEvent(params);

		expect(trackEventMock).toHaveBeenCalledWith('test_event_name', {
			props: { eventName: 'eventValue' }
		});
	});

	it('should NOT call trackEvent or init anything if PLAUSIBLE_ENABLED is false', async () => {
		vi.doMock('$env/plausible.env', () => ({
			PLAUSIBLE_ENABLED: false
		}));

		const { initPlausibleAnalytics, trackEvent } = await import('$lib/services/analytics.services');

		initPlausibleAnalytics();

		expect(Plausible).not.toHaveBeenCalled();
		expect(enableAutoPageviews).not.toHaveBeenCalled();

		const params: TrackEventParams = {
			name: 'test_event_name',
			metadata: { eventName: 'eventValue' }
		};

		await trackEvent(params);

		expect(trackEventMock).not.toHaveBeenCalled();
	});
});
