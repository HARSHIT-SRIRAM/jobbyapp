import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { AiFillStar } from "react-icons/ai";
import { IoLocationSharp } from "react-icons/io5";
import { BsFillBriefcaseFill } from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";
import { TailSpin } from "react-loader-spinner";

import Header from "../Header";
import SimilarJobCard from "../SimilarJobCard";

import "./index.css";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const JobItemDetails = () => {
  const [jobDetailsApiStatus, setJobDetailsApiStatus] = useState(
    apiStatusConstants.initial
  );
  const [jobDetails, setJobDetails] = useState({});
  const [similarJobs, setSimilarJobs] = useState([]);
  const { id } = useParams();

  const getCamelCasedData = (data) => {
    const jobDetails = data.job_details;

    const updatedJobDetails = {
      companyLogoUrl: jobDetails.company_logo_url,
      companyWebsiteUrl: jobDetails.company_website_url,
      employmentType: jobDetails.employment_type,
      jobDescription: jobDetails.job_description,
      location: jobDetails.location,
      rating: jobDetails.rating,
      title: jobDetails.title,
      packagePerAnnum: jobDetails.package_per_annum,
      skills: jobDetails.skills.map((eachSkill) => ({
        imageUrl: eachSkill.image_url,
        name: eachSkill.name,
      })),
      lifeAtCompnay: {
        description: jobDetails.life_at_company.description,
        imageUrl: jobDetails.life_at_company.image_url,
      },
    };

    const similarJobs = data.similar_jobs.map((eachJob) => ({
      companyLogoUrl: eachJob.company_logo_url,
      employmentType: eachJob.employment_type,
      id: eachJob.id,
      jobDescription: eachJob.job_description,
      location: eachJob.location,
      rating: eachJob.rating,
      title: eachJob.title,
    }));

    return { updatedJobDetails, similarJobs };
  };

  const getJobItemDetails = useCallback(async () => {
    setJobDetailsApiStatus(apiStatusConstants.inProgress);
    const jwtToken = Cookies.get("jwt_token");
    const apiUrl = `https://cors-anywhere.herokuapp.com/https://apis.ccbp.in/jobs/${id}`;
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: "GET",
    };

    try {
      const response = await fetch(apiUrl, options);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const { updatedJobDetails, similarJobs } = getCamelCasedData(data);
      setJobDetails(updatedJobDetails);
      setSimilarJobs(similarJobs);
      setJobDetailsApiStatus(apiStatusConstants.success);
    } catch (error) {
      console.error("Error fetching job details:", error);
      setJobDetailsApiStatus(apiStatusConstants.failure);
    }
  }, [id]);

  useEffect(() => {
    console.log("Job ID changed:", id);
    getJobItemDetails();
  }, [id, getJobItemDetails]);

  const renderLoaderView = () => (
    <div className="jobs-loader-container" data-testid="loader">
      <TailSpin height="50" width="50" color="#ffffff" ariaLabel="loading" />
    </div>
  );

  const renderApiFailureView = () => (
    <div className="jobs-api-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="job-api-failure-image"
      />
      <h1 className="failure-view-heading">Oops! Something Went Wrong</h1>
      <p className="failure-view-description">
        We cannot seem to find the page you are looking for.
      </p>
      <button
        type="button"
        className="retry-button"
        onClick={getJobItemDetails}
      >
        Retry
      </button>
    </div>
  );

  const renderJobDetails = () => {
    if (!jobDetails || !jobDetails.title) {
      return renderApiFailureView();
    }
    const {
      companyLogoUrl,
      employmentType,
      jobDescription,
      location,
      rating,
      title,
      packagePerAnnum,
      companyWebsiteUrl,
      skills,
      lifeAtCompnay,
    } = jobDetails;

    return (
      <div className="job-details-content-container">
        <div className="job-details">
          <div className="logo-title-container-card">
            <img
              src={companyLogoUrl}
              alt="job details company logo"
              className="company-logo-card"
            />
            <div className="title-rating-container-card">
              <h1 className="job-title-card">{title}</h1>
              <div className="rating-container-card">
                <AiFillStar className="star-icon-card" />
                <p className="rating-number-card">{rating}</p>
              </div>
            </div>
          </div>
          <div className="location-package-container-card">
            <div className="icon-type-container-card">
              <IoLocationSharp className="type-icon" />
              <p className="type-text">{location}</p>
            </div>
            <div className="icon-type-container-card">
              <BsFillBriefcaseFill className="type-icon" />
              <p className="type-text">{employmentType}</p>
            </div>
            <p className="package-text">{packagePerAnnum}</p>
          </div>

          <hr className="separator" />
          <div className="description-visit-link-container">
            <h1 className="description-heading-card">Description</h1>
            <a
              href={companyWebsiteUrl}
              className="company-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit
              <FiExternalLink className="external-link-logo" />
            </a>
          </div>
          <p className="job-description-card">{jobDescription}</p>
          <h1 className="skills-heading">Skills</h1>
          <ul className="skills-list">
            {skills.map((eachSkill) => (
              <li className="skill-item" key={eachSkill.imageUrl}>
                <img
                  src={eachSkill.imageUrl}
                  alt={eachSkill.name}
                  className="skill-image"
                />
                <p className="skill-name">{eachSkill.name}</p>
              </li>
            ))}
          </ul>
          <h1 className="life-at-company-heading">Life at Company</h1>
          <div className="company-life-container">
            <p className="life-description">{lifeAtCompnay.description}</p>
            <img
              className="life-image"
              src={lifeAtCompnay.imageUrl}
              alt="life at company"
            />
          </div>
        </div>
        <h1 className="similar-jobs-heading">Similar Jobs</h1>
        <ul className="similar-jobs-list">
          {similarJobs.map((eachJob) => (
            <SimilarJobCard key={eachJob.id} jobDetails={eachJob} />
          ))}
        </ul>
      </div>
    );
  };

  const renderJobDetailsPage = () => {
    switch (jobDetailsApiStatus) {
      case apiStatusConstants.inProgress:
        return renderLoaderView();
      case apiStatusConstants.success:
        return renderJobDetails();
      case apiStatusConstants.failure:
        return renderApiFailureView();
      default:
        return null;
    }
  };

  return (
    <div className="job-details-page">
      <Header />
      {renderJobDetailsPage()}
    </div>
  );
};

export default JobItemDetails;
