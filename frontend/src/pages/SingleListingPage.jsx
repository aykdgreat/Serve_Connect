import { useParams } from "react-router-dom";
import api from "../helpers/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { enqueueSnackbar } from "notistack";
import { formatDistanceToNow } from "date-fns";

const SingleListingPage = () => {
  const [listing, setListing] = useState({});
  const [canApply, setCanApply] = useState(false);
  const [listingConnections, setListingConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasUserRequested, setHasUserRequested] = useState(false);
  const [cannotApplyReason, setCannotApplyReason] = useState("");

  const [reason, setReason] = useState();

  const param = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formattedDate, setFormattedDate] = useState("");
  useEffect(() => {
    const getListing = async () => {
      try {
        const res = await api.get(`/listings/all_service/${param.id}/`);
        setListing(res.data);
        const { created } = res.data;
        setFormattedDate(
          formatDistanceToNow(new Date(created), {
            addSuffix: true,
          })
        );
      } catch (error) {
        if (error.status === 404) {
          navigate("/not-found");
        }
      }
    };
    getListing();
    getConnections();
  }, []);

  useEffect(() => {
    handleCanApply();
    getConnections();
  }, [listing]);
  const getConnections = async () => {
    try {
      const res = await api.get(`/listings/services/${param.id}/interaction/`);

      const filteredConnection = res.data.filter(
        (item) => item.user === user.id
      );

      setHasUserRequested(filteredConnection.length > 0);
      setListingConnections(res.data);

      // console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  const handleCanApply = () => {
    if (user.accountType == "volunteer") {
      // console.log(listing.expectation);
      // console.log(user.basedOn);
      listing.expectation && listing.expectation.length == 0
        ? setCanApply(true)
        : setCanApply(
            listing.expectation &&
              listing.expectation.some((element) =>
                user.basedOn.includes(element)
              )
          );
      setCannotApplyReason(
        `
        You cannot apply because you are only volunteering based on ${String(
          user.basedOn
        )
          .split(",")
          .join(" and ")}
        `
      );
    }
  };

  const handleIndicateInterest = async (e) => {
    e.preventDefault();

    const data = {
      reason,
    };
    setLoading(true);
    try {
      const res = await api.post(
        `listings/all_service/${param.id}/create_reason/`,
        data
      );
      if (res.status === 201) {
        enqueueSnackbar(
          "You have succesfully indicated your interest! Your request is now pending acceptance",
          {
            variant: "success",
          }
        );
        setReason("");
        setCanApply(false);
        navigate("/connections");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (state, id) => {
    setLoading(true);
    try {
      const res = await api.post(`listings/interaction_state/${id}/`, {
        state,
      });
      // console.log(res);
      if (res.status === 200 && state === "ACCEPT") {
        enqueueSnackbar("You have accepted the connection request!", {
          variant: "success",
        });

        setListingConnections(
          listingConnections.map((el) =>
            el.id === id ? { ...el, state: 1 } : el
          )
        );
      } else if (res.status === 200 && state === "DECLINE") {
        enqueueSnackbar("You have rejected the connection request!", {
          variant: "success",
        });

        setListingConnections(
          listingConnections.map((el) =>
            el.id === id ? { ...el, state: 0 } : el
          )
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article>
      <div
        id="details"
        className="max-w-lg mx-auto p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8"
      >
        <h1 className="text-3xl text-center uppercase">{listing.title}</h1>
        <p className="text-center text-lg">
          By:
          {listing.org_name !== ""
            ? `${listing.org_name} (${listing.org_type})`
            : `${listing.first_name} ${listing.last_name}`}
          <span className="block align-middle text-sm font-normal text-gray-500">
            Posted {formattedDate}
          </span>
        </p>
        <div className="font-medium my-2" style={{ whiteSpace: 'pre-line' }}>{listing.description}</div>
        <div>Duration: {listing.duration}</div>
        <div>
          Accepting volunteers based on:{" "}
          {listing.expectation &&
            (listing.expectation.length > 0 ? (
              listing.expectation.map((el, index) => (
                <span
                  key={index}
                  className="bg-gray-200  text-xs font-medium px-3 mr-2 py-1 rounded-full"
                >
                  {el}
                </span>
              ))
            ) : (
              <span className="bg-gray-200  text-xs font-medium px-3 mr-2 py-1 rounded-full">
                All
              </span>
            ))}
        </div>
        <div>
          Category:
          <span className="font-medium"> {listing.category}</span>
        </div>
      </div>
      {user.accountType == "volunteer" && (
        <div
          id="match"
          className="mt-4 max-w-lg mx-auto p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8"
        >
          <h1 className="mb-2 text-xl font-semibold">Indicate Interest</h1>
          <form onSubmit={handleIndicateInterest}>
            <label htmlFor="reason" className="block mb-2">
              Describe yourself and why you should be accepted to serve
              (optional)
            </label>
            <textarea
              value={reason}
              className="block mb-2 p-2.5 w-full h-24 bg-gray-50 rounded-lg border border-gray-300 focus:border-gray-500 focus:outline-none "
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
            <Button
              loading={loading}
              disabled={!canApply || loading || hasUserRequested}
              text="Send request"
            ></Button>
            {hasUserRequested && (
              <div className="text-sm text-gray-700 font-semibold">
                You have already sent a connection request!
              </div>
            )}
            {!canApply && (
              <div className="text-sm text-gray-700 font-semibold">
                {cannotApplyReason}
              </div>
            )}
          </form>
        </div>
      )}
      {user.accountType !== "volunteer" && user.id === listing.user && (
        <div className="mt-4 max-w-lg mx-auto p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8">
          <h1 className="mb-2 text-xl font-semibold">Interactions</h1>
          {listingConnections.length > 0 ? (
            <>
              <ul>
                {listingConnections.map((interaction) => (
                  <li
                    className="bg-white border-b p-2 border-gray-200 hover:bg-gray-100"
                    key={interaction.id}
                  >
                    <div className="flex items-center justify-between">
                      <p>
                        {" > "} Volunteer {interaction.username} sent a
                        connection request
                        {interaction.reason &&
                          ` with description "${interaction.reason}" `}
                        <span className="ml-1 align-middle text-sm font-normal text-gray-500">
                          {formatDistanceToNow(new Date(interaction.created), {
                            addSuffix: true,
                          })}
                        </span>
                      </p>
                      <div>
                        <button
                          disabled={interaction.state == 1}
                          onClick={() =>
                            handleConfirm("ACCEPT", interaction.id)
                          }
                          className="text-green-700 disabled:text-green-700/50 hover:underline mr-3 font-semibold cursor-pointer"
                        >
                          {" "}
                          Accept
                        </button>
                        <button
                          disabled={interaction.state == 0}
                          onClick={() =>
                            handleConfirm("DECLINE", interaction.id)
                          }
                          className="text-red-700 disabled:text-red-700/50 hover:underline mr-3 font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div>
              This listing has no connection request yet. Check back later!
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default SingleListingPage;
