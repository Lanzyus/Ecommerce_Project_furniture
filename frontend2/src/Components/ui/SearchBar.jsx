import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(`/search?search=${encodeURIComponent(query)}`);
  };

  // const submit = (e) => {
  //   e.preventDefault();
  //   navigate(`/search?q=${query}`);
  // };

  return (
    <form onSubmit={submit}>
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e)=>setQuery(e.target.value)}
      />
      <button type="submit">
        Search
      </button>
    </form>
  );
}