import CartParser from './CartParser';

let parser;

beforeEach(() => {
    parser = new CartParser();
});

describe("CartParser - unit tests", () => {
    it('should return an empty array when content string is valid', () => {
        const content = 'Product name,Price,Quantity\nMollis consequat,9.00,2';
        const errors = parser.validate(content);

        expect(errors).toEqual(expect.any(Array));
        expect(errors).toHaveLength(0);
    });

    it('should return an empty array when content string is valid and contains only column headers', () => {
        const content = 'Product name,Price,Quantity';
        const errors = parser.validate(content);

        expect(errors).toEqual(expect.any(Array));
        expect(errors).toHaveLength(0);
    });

    it('should return an array with one error when header is invalid', () => {
        const content = 'Product name,Price,Test\nMollis consequat,9.00,2';
        const errors = parser.validate(content);

        expect(errors).toEqual(expect.any(Array));
        expect(errors).toHaveLength(1);
        expect(errors[0].type).toEqual(parser.ErrorType.HEADER);
    });

    it('should return an array with one error when row cell is missing', () => {
        const content = 'Product name,Price,Quantity\nMollis consequat,9.00';
        const errors = parser.validate(content);

        expect(errors).toEqual(expect.any(Array));
        expect(errors).toHaveLength(1);
        expect(errors[0].type).toEqual(parser.ErrorType.ROW);
    });

    it('should return an array with one error when row cell value is missing', () => {
        const content = 'Product name,Price,Quantity\n,9.00,2';
        const errors = parser.validate(content);

        expect(errors).toEqual(expect.any(Array));
        expect(errors).toHaveLength(1);
        expect(errors[0].type).toEqual(parser.ErrorType.CELL);
    });

    it('should return an array with one error when value is a negative number instead of positive', () => {
        const content = 'Product name,Price,Quantity\nMollis consequat,-4,2';
        const errors = parser.validate(content);

        expect(errors).toEqual(expect.any(Array));
        expect(errors).toHaveLength(1);
        expect(errors[0].type).toEqual(parser.ErrorType.CELL);
    });

    it('should return an array with one error when value is a string instead of positive number', () => {
        const content = 'Product name,Price,Quantity\nMollis consequat,test,2';
        const errors = parser.validate(content);

        expect(errors).toEqual(expect.any(Array));
        expect(errors).toHaveLength(1);
        expect(errors[0].type).toEqual(parser.ErrorType.CELL);
    });

    it('should return an object that represents cart item', () => {
        const csv = 'Condimentum aliquet,13.90,1';
        const item = parser.parseLine(csv);

        expect(item).toEqual(expect.objectContaining({
            id: expect.any(String),
            name: 'Condimentum aliquet',
            price: 13.90,
            quantity: 1
        }));
    });

    it('should return calculated cart amount', () => {
        const cartItems = [
            {
                price: 11,
                quantity: 2
            }
        ];

        expect(parser.calcTotal(cartItems)).toBe(22);
    });

    it('should return custom error object', () => {
        expect(parser.createError('header', 1, 2, 'message')).toEqual({
            type: 'header',
            row: 1,
            column: 2,
            message: 'message'
          });
    });
});

describe("CartParser - integration tests", () => {
    it('should return JSON with array of one item and calculated cart amount', () => {
        parser.readFile = jest.fn();

        parser.readFile.mockReturnValue('Product name,Price,Quantity\nMollis consequat,9.00,2');

        const result = parser.parse('');

        expect(result).toEqual(expect.objectContaining({
            items: expect.any(Array),
            total: 18
        }));
        expect(result.items).toHaveLength(1);
    });
});
