CR ?= univer-acr-registry.cn-shenzhen.cr.aliyuncs.com
LOCAL_TAG = dev
PUSH_TAG ?= latest
REPOSITORY = 
NS ?= univer
CTR = docker
BUILDER ?= univerdocs-builder
BUILDKIT_IMAGE ?=
ADD_HOST ?=
NPM_REGISTRY ?= ""
BASE_IMAGE ?=
HTTP_PROXY ?=

BUILDKIT_IMAGE_OPT =
ifneq ($(strip $(BUILDKIT_IMAGE)),)
BUILDKIT_IMAGE_OPT = --driver-opt image="$(BUILDKIT_IMAGE)"
endif

ADD_HOST_OPT =
ifneq ($(strip $(ADD_HOST)),)
ADD_HOST_OPT = --add-host "$(ADD_HOST)"
endif

BASE_IMAGE_ARG =
ifneq ($(strip $(BASE_IMAGE)),)
BASE_IMAGE_ARG = --build-arg BASE_IMAGE="$(BASE_IMAGE)"
endif

HTTP_PROXY_ARG =
ifneq ($(strip $(HTTP_PROXY)),)
HTTP_PROXY_ARG = --build-arg HTTP_PROXY="$(HTTP_PROXY)"
endif

# Environment variables
NEXT_POSTHOG_APIKEY =
NEXT_PUBLIC_DOCS_SOURCE_REF ?= $(shell git branch --show-current)

OSARCH = linux/amd64
image_exists=$(shell docker manifest inspect $(CR)/$(NS)/$(REPOSITORY):$(IMAGE_TAG) > /dev/null 2>&1 && echo true || echo false)

.PHONY: create_builder
# Check if the builder exists and create it if not
create_builder:
	@if ! $(CTR) buildx inspect $(BUILDER) > /dev/null 2>&1; then \
		$(CTR) buildx create --name $(BUILDER) $(BUILDKIT_IMAGE_OPT) --use; \
	fi

.PHONY: push_image
# Build and Push multi-platform Docker images for univer docs
push_image: create_builder
ifeq ($(PUSH_TAG), latest)
	$(eval image_tag=-t $(CR)/$(NS)/$(REPOSITORY):latest)
else
	$(eval image_tag=-t $(CR)/$(NS)/$(REPOSITORY):$(PUSH_TAG))
endif
	$(CTR) buildx build \
	$(BASE_IMAGE_ARG) \
	$(ADD_HOST_OPT) \
	--build-arg CR=$(CR) \
	--build-arg NPM_REGISTRY=$(NPM_REGISTRY) \
	$(HTTP_PROXY_ARG) \
	--build-arg NEXT_POSTHOG_APIKEY=$(NEXT_POSTHOG_APIKEY) \
	--build-arg NEXT_PUBLIC_DOCS_SOURCE_REF=$(NEXT_PUBLIC_DOCS_SOURCE_REF) \
	--builder $(BUILDER) \
	--platform $(OSARCH) \
	--progress=plain \
	--file Dockerfile \
	$(image_tag) \
	--push .

.PHONY: check_image
# Check if the image exists
check_image:
	@echo $(image_exists)

.PHONY: build_image
build_image: create_builder
	$(eval image_tag=-t $(REPOSITORY):latest)
	$(CTR) buildx build \
	$(BASE_IMAGE_ARG) \
	$(ADD_HOST_OPT) \
	--build-arg NEXT_PUBLIC_DOCS_SOURCE_REF=$(NEXT_PUBLIC_DOCS_SOURCE_REF) \
	--builder $(BUILDER) \
	--platform $(OSARCH) \
	--file Dockerfile \
	$(image_tag) \
	--load .

.PHONY: test_image_run
test_image_run: create_builder 
	$(eval image_tag=-t $(REPOSITORY):latest)
	$(CTR) run --rm -it -p 3000:3000 $(image_tag)
