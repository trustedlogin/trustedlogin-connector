import React from 'react';

//Makes sure the typsescript works.
export default function TsTest({children}: {children: React.ReactNode}){
    console.log(children);
    return (
        <>
            {children}
        </>
    )
}
