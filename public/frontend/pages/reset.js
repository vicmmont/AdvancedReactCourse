import Link from 'next/link';
import Reset from '../components/Reset';

const ResetPage = props => <Reset resetToken={props.query.resetToken} />;

export default ResetPage;
