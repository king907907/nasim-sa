import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { s as getForecast } from "./met.server-4E0qbmIX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forecast.functions-BcNt1aK1.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var loadHomeForecast_createServerFn_handler = createServerRpc({
	id: "5351974dffcec6ec530cb744cfd6a945dac25a363cccae9fac791e2e5591b958",
	name: "loadHomeForecast",
	filename: "src/lib/weather/forecast.functions.ts"
}, (opts) => loadHomeForecast.__executeServer(opts));
var loadHomeForecast = createServerFn({ method: "GET" }).handler(loadHomeForecast_createServerFn_handler, async () => {
	try {
		return await getForecast(21.5433, 39.1728);
	} catch (error) {
		console.error("[naseem] home forecast failed", error);
		return null;
	}
});
//#endregion
export { loadHomeForecast_createServerFn_handler };
