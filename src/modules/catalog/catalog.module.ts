import { Module } from "@nestjs/common";
import { CatalogRepository } from "./catalog.repository";
import { CatalogService } from "./catalog.service";

// Headless domain module: catalog owns session/hall/seat data and exposes only
// CatalogService. It has NO controller and NO dependency on booking — the public
// /sessions read surface (and the seat-availability composition) lives in the
// browse facade above it. The repository stays internal.
@Module({
  providers: [CatalogService, CatalogRepository],
  exports: [CatalogService],
})
export class CatalogModule {}
