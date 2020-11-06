import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return <h1>{currentUser ? 'You are signed in' : 'You are NOT signed in'}</h1>;
};

//This method can be called at server during SSR
//or at client during navigator through the route
LandingPage.getInitialProps = async (context) => {
  const { data } = await buildClient(context).get('/api/users/currentuser');
  return data;
};

export default LandingPage;
