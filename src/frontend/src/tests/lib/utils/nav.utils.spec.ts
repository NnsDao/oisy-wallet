import * as appNavigation from '$app/navigation';
import { ICP_NETWORK_ID } from '$env/networks.env';
import {
	AppPath,
	NETWORK_PARAM,
	ROUTE_ID_GROUP_APP,
	TOKEN_PARAM,
	URI_PARAM
} from '$lib/constants/routes.constants';
import {
	back,
	gotoReplaceRoot,
	isRouteActivity,
	isRouteDappExplorer,
	isRouteSettings,
	isRouteTokens,
	isRouteTransactions,
	loadRouteParams,
	networkParam,
	resetRouteParams,
	type RouteParams
} from '$lib/utils/nav.utils';
import type { LoadEvent, Page } from '@sveltejs/kit';
import { describe, expect } from 'vitest';

describe('nav.utils', () => {
	const mockGoTo = vi.fn();

	beforeAll(() => {
		vi.resetAllMocks();

		vi.spyOn(appNavigation, 'goto').mockImplementation(mockGoTo);
	});

	describe('networkParam', () => {
		it('should return an empty string when networkId is undefined', () => {
			expect(networkParam(undefined)).toBe('');
		});

		it('should return the formatted network parameter when networkId is provided', () => {
			expect(networkParam(ICP_NETWORK_ID)).toBe(`${NETWORK_PARAM}=${ICP_NETWORK_ID.description}`);
		});
	});

	describe('back', () => {
		it('should call history.back when pop is true', async () => {
			const historyBackMock = vi.spyOn(history, 'back');
			await back({ pop: true });
			expect(historyBackMock).toHaveBeenCalled();
		});

		it('should navigate to "/" when pop is false', async () => {
			await back({ pop: false });
			expect(mockGoTo).toHaveBeenCalledWith('/');
		});
	});

	describe('gotoReplaceRoot', () => {
		it('should navigate to "/" with replaceState', async () => {
			await gotoReplaceRoot();
			expect(mockGoTo).toHaveBeenCalledWith('/', { replaceState: true });
		});
	});

	describe('loadRouteParams', () => {
		it('should return undefined values if not in a browser', () => {
			const result = loadRouteParams({
				url: {
					searchParams: {
						get: vi.fn((_) => null)
					}
				}
			} as unknown as LoadEvent);
			expect(result).toEqual({
				[TOKEN_PARAM]: null,
				[NETWORK_PARAM]: null,
				[URI_PARAM]: null
			});
		});

		it('should parse route parameters correctly', () => {
			expect(
				loadRouteParams({
					url: {
						searchParams: {
							get: vi.fn((key) => (key === TOKEN_PARAM ? 'testToken' : null))
						}
					}
				} as unknown as LoadEvent)
			).toEqual({
				[TOKEN_PARAM]: 'testToken',
				[NETWORK_PARAM]: null,
				[URI_PARAM]: null
			});

			expect(
				loadRouteParams({
					url: {
						searchParams: {
							get: vi.fn((key) => (key === NETWORK_PARAM ? 'testNetwork' : null))
						}
					}
				} as unknown as LoadEvent)
			).toEqual({
				[TOKEN_PARAM]: null,
				[NETWORK_PARAM]: 'testNetwork',
				[URI_PARAM]: null
			});

			expect(
				loadRouteParams({
					url: {
						searchParams: {
							get: vi.fn((key) => (key === URI_PARAM ? 'testURI' : null))
						}
					}
				} as unknown as LoadEvent)
			).toEqual({
				[TOKEN_PARAM]: null,
				[NETWORK_PARAM]: null,
				[URI_PARAM]: 'testURI'
			});
		});
	});

	describe('resetRouteParams', () => {
		it('should return an object with all values set to null', () => {
			const result = resetRouteParams();

			Object.keys(result).forEach((key) => {
				expect(result[key as keyof RouteParams]).toBeNull();
			});
		});
	});

	describe('Route Check Functions', () => {
		const mockPage = (id: string): Page => ({
			params: {},
			route: { id },
			status: 200,
			error: null,
			data: {},
			url: URL.prototype,
			state: {},
			form: null
		});

		describe('isRouteTransactions', () => {
			it('should return true when route id matches Transactions path', () => {
				expect(isRouteTransactions(mockPage(`${ROUTE_ID_GROUP_APP}${AppPath.Transactions}`))).toBe(
					true
				);
			});

			it('should return false when route id does not match Transactions path', () => {
				expect(isRouteTransactions(mockPage(`${ROUTE_ID_GROUP_APP}/wrongPath`))).toBe(false);

				expect(isRouteTransactions(mockPage(`${ROUTE_ID_GROUP_APP}${AppPath.Settings}`))).toBe(
					false
				);

				expect(isRouteTransactions(mockPage(`${ROUTE_ID_GROUP_APP}`))).toBe(false);

				expect(isRouteTransactions(mockPage(`/anotherGroup/${AppPath.Transactions}`))).toBe(false);
			});
		});

		describe('isRouteSettings', () => {
			it('should return true when route id matches Settings path', () => {
				expect(isRouteSettings(mockPage(`${ROUTE_ID_GROUP_APP}${AppPath.Settings}`))).toBe(true);
			});

			it('should return false when route id does not match Settings path', () => {
				expect(isRouteSettings(mockPage(`${ROUTE_ID_GROUP_APP}/wrongPath`))).toBe(false);

				expect(isRouteSettings(mockPage(`${ROUTE_ID_GROUP_APP}${AppPath.Transactions}`))).toBe(
					false
				);

				expect(isRouteSettings(mockPage(`${ROUTE_ID_GROUP_APP}`))).toBe(false);

				expect(isRouteSettings(mockPage(`/anotherGroup/${AppPath.Settings}`))).toBe(false);
			});
		});

		describe('isRouteDappExplorer', () => {
			it('should return true when route id matches Explore path', () => {
				expect(isRouteDappExplorer(mockPage(`${ROUTE_ID_GROUP_APP}${AppPath.Explore}`))).toBe(true);
			});

			it('should return false when route id does not match Explore path', () => {
				expect(isRouteDappExplorer(mockPage(`${ROUTE_ID_GROUP_APP}/wrongPath`))).toBe(false);

				expect(isRouteDappExplorer(mockPage(`${ROUTE_ID_GROUP_APP}${AppPath.Settings}`))).toBe(
					false
				);

				expect(isRouteDappExplorer(mockPage(`${ROUTE_ID_GROUP_APP}`))).toBe(false);

				expect(isRouteDappExplorer(mockPage(`/anotherGroup/${AppPath.Explore}`))).toBe(false);
			});
		});

		describe('isRouteActivity', () => {
			it('should return true when route id matches Activity path', () => {
				expect(isRouteActivity(mockPage(`${ROUTE_ID_GROUP_APP}${AppPath.Activity}`))).toBe(true);
			});

			it('should return false when route id does not match Activity path', () => {
				expect(isRouteActivity(mockPage(`${ROUTE_ID_GROUP_APP}/wrongPath`))).toBe(false);

				expect(isRouteActivity(mockPage(`${ROUTE_ID_GROUP_APP}${AppPath.Settings}`))).toBe(false);

				expect(isRouteActivity(mockPage(`${ROUTE_ID_GROUP_APP}`))).toBe(false);

				expect(isRouteActivity(mockPage(`/anotherGroup/${AppPath.Activity}`))).toBe(false);
			});
		});

		describe('isRouteTokens', () => {
			it('should return true when route id matches ROUTE_ID_GROUP_APP exactly', () => {
				expect(isRouteTokens(mockPage(ROUTE_ID_GROUP_APP))).toBe(true);
			});

			it('should return false when route id does not match ROUTE_ID_GROUP_APP exactly', () => {
				expect(isRouteTokens(mockPage(`${ROUTE_ID_GROUP_APP}/wrongPath`))).toBe(false);

				expect(isRouteTokens(mockPage(`${ROUTE_ID_GROUP_APP}${AppPath.Settings}`))).toBe(false);

				expect(isRouteTokens(mockPage(`${ROUTE_ID_GROUP_APP}${AppPath.Transactions}`))).toBe(false);

				expect(isRouteTokens(mockPage('/anotherGroup'))).toBe(false);
			});
		});
	});
});
