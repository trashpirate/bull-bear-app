
import { Create } from "components/Create";
import { ProtocolContextProvider } from "contexts/ProtocolContextProvider";
import { FC } from "react";


export const CreateView: FC = ({ }) => {

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-10 mb-8">
          Create
        </h1>
        {/* CONTENT GOES HERE */}
        <div className="text-center">
          <ProtocolContextProvider>
            <Create></Create>
          </ProtocolContextProvider>
        </div>
      </div>
    </div>
  );
};
