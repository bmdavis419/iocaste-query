// Reexport your entry components here
declare const dataTagSymbol: unique symbol;
type dataTagSymbol = typeof dataTagSymbol;

interface FunctionWithShit<TData = string> {
	(): void;
	[dataTagSymbol]: TData;
}

const shit: FunctionWithShit = () => {};

shit[dataTagSymbol] = 'shit';
