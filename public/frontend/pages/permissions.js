import PleaseSignIn from '../components/PleaseSignIn';
import PermissionsComponent from '../components/Permissions';

const Permissions = props => (
  <div>
    <PleaseSignIn>
      <PermissionsComponent />
    </PleaseSignIn>
  </div>
);

export default Permissions;
