import { configure, shallow } from 'enzyme';
import * as Adapter           from 'enzyme-adapter-react-16';

const fiveMinutes = 5 * 60 * 1000;


configure({ adapter: new Adapter() });

// Reset the default of 5000 milliseconds since deposit and withdrawal
// operations take considerably longer to complete
jest.setTimeout(fiveMinutes);
