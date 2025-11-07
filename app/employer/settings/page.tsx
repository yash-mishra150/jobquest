import * as React from 'react';

type Props = Record<string, unknown>;

const page = ({ }: Props) => {
  return (
   <div>
     <h1>page</h1>
     <p>Welcome to the page component!</p>
   </div>
  );
};

export default page;