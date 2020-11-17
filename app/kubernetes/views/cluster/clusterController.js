import angular from 'angular';
import _ from 'lodash-es';
import filesizeParser from 'filesize-parser';
import KubernetesResourceReservationHelper from 'Kubernetes/helpers/resourceReservationHelper';
import { KubernetesResourceReservation } from 'Kubernetes/models/resource-reservation/models';

class KubernetesClusterController {
  /* @ngInject */
  constructor(
    $async,
    $state,
    Notifications,
    LocalStorage,
    Authentication,
    KubernetesNodeService,
    KubernetesApplicationService,
    KubernetesComponentStatusService,
    KubernetesEndpointService
  ) {
    this.$async = $async;
    this.$state = $state;
    this.Notifications = Notifications;
    this.LocalStorage = LocalStorage;
    this.Authentication = Authentication;
    this.KubernetesNodeService = KubernetesNodeService;
    this.KubernetesApplicationService = KubernetesApplicationService;
    this.KubernetesComponentStatusService = KubernetesComponentStatusService;
    this.KubernetesEndpointService = KubernetesEndpointService;

    this.onInit = this.onInit.bind(this);
    this.getNodes = this.getNodes.bind(this);
    this.getNodesAsync = this.getNodesAsync.bind(this);
    this.getApplicationsAsync = this.getApplicationsAsync.bind(this);
    this.getComponentStatus = this.getComponentStatus.bind(this);
    this.getComponentStatusAsync = this.getComponentStatusAsync.bind(this);
    this.getEndpointsAsync = this.getEndpointsAsync.bind(this);
  }

  async getComponentStatusAsync() {
    try {
      this.componentStatuses = await this.KubernetesComponentStatusService.get();
      this.hasUnhealthyComponentStatus = _.find(this.componentStatuses, { Healthy: false }) ? true : false;
    } catch (err) {
      this.Notifications.error('Failure', err, 'Unable to retrieve cluster component statuses');
    }
  }

  getComponentStatus() {
    return this.$async(this.getComponentStatusAsync);
  }

  async getEndpointsAsync() {
    try {
      const endpoints = await this.KubernetesEndpointService.get();
      const systemEndpoints = _.filter(endpoints, { Namespace: 'kube-system' });
      this.systemEndpoints = _.filter(systemEndpoints, (ep) => ep.HolderIdentity);

      const kubernetesEndpoint = _.find(endpoints, { Name: 'kubernetes' });
      if (kubernetesEndpoint && kubernetesEndpoint.Subsets) {
        const ips = _.flatten(_.map(kubernetesEndpoint.Subsets, 'Ips'));
        _.forEach(this.nodes, (node) => {
          node.Api = _.includes(ips, node.IPAddress);
        });
      }
    } catch (err) {
      this.Notifications.error('Failure', err, 'Unable to retrieve endpoints');
    }
  }

  getEndpoints() {
    return this.$async(this.getEndpointsAsync);
  }

  async getNodesAsync() {
    try {
      const nodes = await this.KubernetesNodeService.get();
      _.forEach(nodes, (node) => (node.Memory = filesizeParser(node.Memory)));
      this.nodes = nodes;
      this.CPULimit = Math.trunc(_.reduce(this.nodes, (acc, node) => node.CPU + acc, 0) * 10) / 10;
      this.MemoryLimit = _.reduce(this.nodes, (acc, node) => KubernetesResourceReservationHelper.megaBytesValue(node.Memory) + acc, 0);
    } catch (err) {
      this.Notifications.error('Failure', err, 'Unable to retrieve nodes');
    }
  }

  getNodes() {
    return this.$async(this.getNodesAsync);
  }

  async getApplicationsAsync() {
    try {
      this.state.applicationsLoading = true;
      this.applications = await this.KubernetesApplicationService.get();
      const nodeNames = _.map(this.nodes, (node) => node.Name);
      this.resourceReservation = _.reduce(
        this.applications,
        (acc, app) => {
          app.Pods = _.filter(app.Pods, (pod) => nodeNames.includes(pod.Node));
          const resourceReservation = KubernetesResourceReservationHelper.computeResourceReservation(app.Pods);
          acc.CPU += resourceReservation.CPU;
          acc.Memory += resourceReservation.Memory;
          return acc;
        },
        new KubernetesResourceReservation()
      );
      this.resourceReservation.Memory = KubernetesResourceReservationHelper.megaBytesValue(this.resourceReservation.Memory);
    } catch (err) {
      this.Notifications.error('Failure', 'Unable to retrieve applications', err);
    } finally {
      this.state.applicationsLoading = false;
    }
  }

  getApplications() {
    return this.$async(this.getApplicationsAsync);
  }

  async onInit() {
    this.state = {
      applicationsLoading: true,
      viewReady: false,
      hasUnhealthyComponentStatus: false,
      hasK8sClusterNodeR: this.Authentication.hasAuthorizations(['K8sClusterNodeR']),
    };

    await this.getNodes();
    await this.getEndpoints();
    await this.getComponentStatus();
    await this.getApplications();

    this.state.viewReady = true;
  }

  $onInit() {
    return this.$async(this.onInit);
  }
}

export default KubernetesClusterController;
angular.module('portainer.kubernetes').controller('KubernetesClusterController', KubernetesClusterController);
