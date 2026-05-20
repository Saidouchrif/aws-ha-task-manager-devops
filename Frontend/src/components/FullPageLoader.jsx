const FullPageLoader = () => (
  <div className="d-flex align-items-center justify-content-center app-loader">
    <div className="text-center">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3 mb-0 text-body-secondary">Loading secure session...</p>
    </div>
  </div>
);

export default FullPageLoader;
