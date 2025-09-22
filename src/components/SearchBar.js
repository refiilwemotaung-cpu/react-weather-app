import React from "react";

const SearchBar = ({ searchCity, setSearchCity, handleSearch }) => {
  return (
    <form onSubmit={handleSearch} className="search-bar">
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search for a city..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />
        <button className="btn btn-secondary" type="submit">
          <i className="fas fa-search"></i>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
